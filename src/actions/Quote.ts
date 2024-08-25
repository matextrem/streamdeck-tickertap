import {
  Action,
  DidReceiveSettingsEvent,
  WillAppearEvent,
} from '@fnando/streamdeck';
import { drawQuoteImage } from '../helpers/drawing';
import { ON_PUSH, Settings } from '../helpers/settings';
import httpClient from '../helpers/httpClient';
import { Target } from '@fnando/streamdeck/dist/Target';
import { getApiUrl } from '../helpers/utils';

const LONG_PRESS_THRESHOLD = 500;

class Quote extends Action {
  public settings: Record<string, Settings> = {};
  private lastKeyDownTime = 0;

  public tid: Record<string, number> = {};

  handleDidReceiveSettings(event: DidReceiveSettingsEvent): void {
    this.settings[this.context] = event.settings as Settings;
    if (this.validate()) {
      this.refresh();
    }
  }
  async handleWillAppear(event: WillAppearEvent): Promise<void> {
    const context = this.context;
    this.settings[context] = event.settings as Settings;
    if (this.validate(context)) {
      this.refresh(context);
    }
  }

  async handleKeyDown(): Promise<void> {
    this.lastKeyDownTime = new Date().getTime();
    const context = this.context;
    if (this.validate() && this.settings[context]?.frequency === ON_PUSH) {
      this.refresh();
    }
  }

  async handleKeyUp(): Promise<void> {
    const ctx = this.context;
    const isLongPress =
      new Date().getTime() - this.lastKeyDownTime > LONG_PRESS_THRESHOLD;
    if (isLongPress) {
      const { uri } = await getApiUrl(
        this.settings[ctx]?.type,
        this.settings[ctx]?.region,
        this.settings[ctx]?.ticker
      );
      this.openURL(uri);
    }
    this.lastKeyDownTime = 0;
  }

  validate(context?: string): boolean {
    const ctx = context ?? this.context;
    if (this.settings[ctx]?.ticker && this.settings[ctx]?.frequency) {
      return true;
    }

    this.showAlert({ target: Target.both, context: ctx });
    return false;
  }

  refresh(context?: string) {
    const ctx = context ?? this.context;
    clearInterval(this.tid[ctx]);
    const update = async () => {
      try {
        const quote = await httpClient.get(
          this.settings[ctx]?.ticker,
          this.settings[ctx]?.type,
          this.settings[ctx]?.region,
          this.settings[ctx]?.showIcon
        );

        const image = await drawQuoteImage(
          this.settings[ctx]?.showAs || quote.ticker,
          quote.icon,
          quote.price,
          quote.change,
          quote.percentageChange
        );
        this.setImage(image, { target: Target.both, context: ctx });
      } catch (e) {
        this.showAlert({ target: Target.both, context: ctx });
        this.debug(e, 'Error fetching quote');
      }
    };

    if (this.settings[ctx]?.frequency !== ON_PUSH) {
      this.tid[ctx] = setInterval(
        update,
        1000 * Number(this.settings[ctx]?.frequency)
      );
    }
    update();
  }
}

const quote = new Quote({
  name: 'Get Quote',
  states: [{ image: 'Key' }],
});

quote.enableUserTitle = false;

export default quote;
