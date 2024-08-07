import { DidReceiveSettingsEvent, Inspector } from '@fnando/streamdeck';
import plugin from './plugin';
import { ON_PUSH, QuoteTypes, Regions, Settings } from './helpers/settings';

class DefaultPropertyInspector extends Inspector {
  public settings: Settings = {
    ticker: '',
    showAs: '',
    frequency: ON_PUSH,
    type: QuoteTypes.STOCK,
    showIcon: true,
    region: Regions.US,
  };
  public tickerInput: HTMLInputElement;
  public showAsInput: HTMLInputElement;
  public typeRadio: HTMLDivElement;
  public regionRadio: HTMLDivElement;
  public showIconRadio: HTMLDivElement;
  public frequencyInput: HTMLInputElement;
  public saveBtn: HTMLButtonElement;
  public getCheckedValue: (ele: HTMLDivElement) => string | null; // Adjusted the type definition
  public setCheckedValue: (ele: HTMLDivElement, value: string) => void;

  handleDidConnectToSocket(): void {
    // Set up your HTML event handlers here
    this.tickerInput = document.querySelector('#ticker') as HTMLInputElement;
    this.showAsInput = document.querySelector('#show_as') as HTMLInputElement;
    this.typeRadio = document.querySelector('#type_radio') as HTMLDivElement;
    this.regionRadio = document.querySelector(
      '#region_radio'
    ) as HTMLDivElement;
    this.showIconRadio = document.querySelector(
      '#show_icon_radio'
    ) as HTMLDivElement;
    this.frequencyInput = document.querySelector(
      '#frequency'
    ) as HTMLInputElement;
    this.saveBtn = document.querySelector('#save') as HTMLButtonElement;

    this.saveBtn.disabled = false;

    // Function to get the value of the checked radio button within the specified div
    this.getCheckedValue = function (ele: HTMLDivElement) {
      const checkedRadio = ele.querySelector(
        'input[type="radio"]:checked'
      ) as HTMLInputElement;
      return checkedRadio ? checkedRadio.value : null;
    };

    // Function to set the value of the checked radio button within the specified div
    this.setCheckedValue = (ele: HTMLDivElement, value: string) => {
      const radio = ele.querySelector(
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
        type: this.getCheckedValue(this.typeRadio),
        region: this.getCheckedValue(this.regionRadio),
        showIcon: this.getCheckedValue(this.showIconRadio) === 'true',
        frequency: this.frequencyInput.value,
      });
    };

    document.querySelectorAll<HTMLElement>('[data-url]').forEach((node) => {
      node.onclick = () => {
        this.openURL(node.dataset.url);
      };
    });

    // Add event listeners for type radio buttons to show/hide region radio group
    document.querySelectorAll('input[name="rdio"]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (
          (radio as HTMLInputElement).value === QuoteTypes.STOCK &&
          (radio as HTMLInputElement).checked
        ) {
          this.regionRadio.style.display = 'flex';
        } else {
          this.regionRadio.style.display = 'none';
        }
      });
    });

    // Initial check in case the "Stock" radio button is pre-selected
    if ((document.getElementById('rdio1') as HTMLInputElement).checked) {
      this.regionRadio.style.display = 'flex';
    }
  }

  handleDidReceiveSettings({ settings }: DidReceiveSettingsEvent<Settings>) {
    this.settings = settings;
    this.fillInForm();
  }

  fillInForm() {
    this.tickerInput.value = this.settings.ticker ?? '';
    this.showAsInput.value = this.settings.showAs ?? '';
    this.setCheckedValue(this.typeRadio, this.settings.type);
    this.setCheckedValue(this.regionRadio, this.settings.region);
    this.setCheckedValue(this.showIconRadio, this.settings.showIcon.toString());
    this.frequencyInput.value = this.settings.frequency ?? ON_PUSH;
    // Show or hide region radio group based on current type setting
    if (this.settings.type === QuoteTypes.STOCK) {
      this.regionRadio.style.display = 'flex';
    } else {
      this.regionRadio.style.display = 'none';
    }
  }
}

const inspector = new DefaultPropertyInspector({ plugin });

inspector.run();
