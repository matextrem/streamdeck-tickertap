import { DidReceiveSettingsEvent, Inspector } from '@fnando/streamdeck';
import plugin from './plugin';
import { ON_PUSH, QuoteTypes, Settings } from './helpers/settings';

class DefaultPropertyInspector extends Inspector {
  public settings: Settings = {
    ticker: '',
    showAs: '',
    frequency: ON_PUSH,
    type: QuoteTypes.STOCK,
  };
  public tickerInput: HTMLInputElement;
  public showAsInput: HTMLInputElement;
  public typeRadio: HTMLInputElement;
  public frequencyInput: HTMLInputElement;
  public saveBtn: HTMLButtonElement;
  public getCheckedValue: () => string;
  public setCheckedValue: (value: string) => void;

  handleDidConnectToSocket(): void {
    // Set up your HTML event handlers here
    this.tickerInput = document.querySelector('#ticker');
    this.showAsInput = document.querySelector('#show_as');
    this.typeRadio = document.querySelector('#type_radio');
    this.frequencyInput = document.querySelector('#frequency');

    this.saveBtn = document.querySelector('#save');

    this.saveBtn.disabled = false;

    // Function to get the value of the checked radio button within the specified div
    this.getCheckedValue = function () {
      const checkedRadio = this.typeRadio.querySelector(
        'input[type="radio"]:checked'
      );
      return checkedRadio ? checkedRadio.value : null;
    };

    // Function to set the value of the checked radio button within the specified div
    this.setCheckedValue = function (value) {
      const radio = this.typeRadio.querySelector(
        `input[value="${value}"]`
      ) as HTMLInputElement;
      if (radio) {
        radio.checked = true;
      }
    };

    this.tickerInput.oninput = () => {
      //Update the showAs input with the ticker value
      this.showAsInput.value = this.tickerInput.value;
    };

    this.saveBtn.onclick = () => {
      if (!this.tickerInput.value) {
        alert('Please choose a ticker symbol');
        return;
      }

      this.setSettings({
        ticker: this.tickerInput.value,
        showAs: this.showAsInput.value,
        type: this.getCheckedValue(),
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
    this.showAsInput.value = this.settings.showAs ?? '';
    this.setCheckedValue(this.settings.type);
    this.frequencyInput.value = this.settings.frequency ?? ON_PUSH;
  }
}

const inspector = new DefaultPropertyInspector({ plugin });

inspector.run();
