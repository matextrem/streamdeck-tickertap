import { DidReceiveSettingsEvent, Inspector } from '@fnando/streamdeck';
import plugin from './plugin';
import { ON_PUSH, QuoteTypes, Regions, Settings } from './helpers/settings';
import { ImgState } from './images/actions/images';

class DefaultPropertyInspector extends Inspector {
  public settings: Settings = {
    ticker: '',
    showAs: '',
    frequency: ON_PUSH,
    type: QuoteTypes.STOCK,
    showIcon: true,
    region: Regions.US,
    showTotal: false,
    totalAmount: 0,
    risingColor: ImgState.increasing,
    fallingColor: ImgState.decreasing,
  };
  public tickerInput: HTMLInputElement;
  public showAsInput: HTMLInputElement;
  public typeInput: HTMLInputElement;
  public regionRadio: HTMLDivElement;
  public showIconRadio: HTMLDivElement;
  public frequencyInput: HTMLInputElement;
  public showTotalRadio: HTMLDivElement;
  public totalAmountInput: HTMLInputElement;
  public totalAmountWrapperElement: HTMLDivElement;
  public risingColorInput: HTMLInputElement;
  public fallingColorInput: HTMLInputElement;
  public saveBtn: HTMLButtonElement;
  public getCheckedValue: (ele: HTMLDivElement) => string | null; // Adjusted the type definition
  public setCheckedValue: (ele: HTMLDivElement, value: string) => void;

  handleDidConnectToSocket(): void {
    // Set up your HTML event handlers here
    this.tickerInput = document.querySelector('#ticker') as HTMLInputElement;
    this.showAsInput = document.querySelector('#show_as') as HTMLInputElement;
    this.typeInput = document.querySelector('#type') as HTMLInputElement;
    this.regionRadio = document.querySelector(
      '#region_radio'
    ) as HTMLDivElement;
    this.showIconRadio = document.querySelector(
      '#show_icon_radio'
    ) as HTMLDivElement;
    this.frequencyInput = document.querySelector(
      '#frequency'
    ) as HTMLInputElement;
    this.showTotalRadio = document.querySelector(
      '#total_radio'
    ) as HTMLInputElement;
    this.totalAmountInput = document.querySelector(
      '#total_amount'
    ) as HTMLInputElement;
    this.totalAmountWrapperElement = document.querySelector('#total_amount_wrapper') as HTMLDivElement;
    this.risingColorInput = document.querySelector(
      '#rising-color'
    ) as HTMLInputElement;
    this.fallingColorInput = document.querySelector(
      '#falling-color'
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
        type: this.typeInput.value as QuoteTypes,
        region: this.getCheckedValue(this.regionRadio),
        showIcon: this.getCheckedValue(this.showIconRadio) === 'true',
        frequency: this.frequencyInput.value,
        showTotal: this.getCheckedValue(this.showTotalRadio) === 'true',
        totalAmount: parseInt(this.totalAmountInput.value),
        risingColor: this.risingColorInput.value,
        fallingColor: this.fallingColorInput.value,
      });
    };

    document.querySelectorAll<HTMLElement>('[data-url]').forEach((node) => {
      node.onclick = () => {
        this.openURL(node.dataset.url);
      };
    });

    // Show or hide region radio group based on current type setting
    this.typeInput.addEventListener('change', () => {
      if (this.typeInput.value === QuoteTypes.STOCK) {
        this.regionRadio.style.display = 'flex';
      } else {
        this.regionRadio.style.display = 'none';
      }
    });

    // Initialize the region radio group based on the current type setting
    if (this.settings.type === QuoteTypes.STOCK) {
      this.regionRadio.style.display = 'flex';
    }

    // Show or hide total amount based on show total setting
    this.showTotalRadio.querySelectorAll<HTMLInputElement>('input[name="total-radio"]').forEach((el) => {
      el.addEventListener('change', (e) => {
        let element = e.target as HTMLInputElement;
        if (element.checked && element.value === 'true') {
          this.totalAmountWrapperElement.style.display = 'flex';
        } else if(element.checked) {
          this.totalAmountWrapperElement.style.display = 'none';
        }
      });
    })

    if(this.settings.showTotal) {
      this.totalAmountWrapperElement.style.display = 'flex';
    } 
  }

  handleDidReceiveSettings({ settings }: DidReceiveSettingsEvent<Settings>) {
    this.settings = settings;
    this.fillInForm();
  }

  fillInForm() {
    this.tickerInput.value = this.settings.ticker ?? '';
    this.showAsInput.value = this.settings.showAs ?? '';
    this.setCheckedValue(this.regionRadio, this.settings.region);
    this.setCheckedValue(this.showIconRadio, this.settings.showIcon.toString());
    this.frequencyInput.value = this.settings.frequency ?? ON_PUSH;
    this.setCheckedValue(this.showTotalRadio, this.settings.showTotal.toString());
    this.totalAmountInput.value = this.settings.totalAmount.toString();
    this.risingColorInput.value =
      this.settings.risingColor ?? ImgState.increasing;
    this.fallingColorInput.value =
      this.settings.fallingColor ?? ImgState.decreasing;
    this.typeInput.value = this.settings.type;
    // Show or hide region radio group based on current type setting
    if (this.settings.type === QuoteTypes.STOCK) {
      this.regionRadio.style.display = 'flex';
    } else {
      this.regionRadio.style.display = 'none';
    }
    if(this.settings.showTotal) {
      this.totalAmountWrapperElement.style.display = 'flex';
    } else {
      this.totalAmountWrapperElement.style.display = 'none';
    }
  }
}

const inspector = new DefaultPropertyInspector({ plugin });

inspector.run();
