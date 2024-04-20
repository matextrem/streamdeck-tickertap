import { DidReceiveSettingsEvent, Inspector } from '@fnando/streamdeck';
import plugin from './plugin';
import { ON_PUSH, Settings } from './helpers/settings';

class DefaultPropertyInspector extends Inspector {
  public settings: Settings = { ticker: '', frequency: ON_PUSH };
  public tickerInput: HTMLInputElement;
  public frequencyInput: HTMLInputElement;
  public saveBtn: HTMLButtonElement;

  handleDidConnectToSocket(): void {
    // Set up your HTML event handlers here
    this.tickerInput = document.querySelector('#ticker');
    this.frequencyInput = document.querySelector('#frequency');

    this.saveBtn = document.querySelector('#save');

    this.saveBtn.disabled = false;

    this.saveBtn.onclick = () => {
      if (!this.tickerInput.value) {
        alert('Please choose a ticker symbol');
        return;
      }

      this.setSettings({
        ticker: this.tickerInput.value,
        frequency: this.frequencyInput.value,
      });
    };

    document.querySelectorAll<HTMLElement>('[data-url]').forEach((node) => {
      node.onclick = () => {
        this.openURL(node.dataset.url);
      };
    });
  }

  handleDidReceiveSettings({ settings }: DidReceiveSettingsEvent<Settings>) {
    this.settings = settings;
    this.fillInForm();
  }

  fillInForm() {
    this.tickerInput.value = this.settings.ticker ?? '';
    this.frequencyInput.value = this.settings.frequency ?? ON_PUSH;
  }
}

const inspector = new DefaultPropertyInspector({ plugin });

inspector.run();
