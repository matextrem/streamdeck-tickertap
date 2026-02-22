import { DidReceiveSettingsEvent, Inspector } from '@fnando/streamdeck';
import plugin from './plugin';
import {
  ON_PUSH,
  CUSTOM,
  QuoteTypes,
  Regions,
  Settings,
  Currency,
} from './helpers/settings';
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
    avgPrice: 0,
    risingColor: ImgState.increasing,
    fallingColor: ImgState.decreasing,
    currency: Currency.USD,
    showGradient: true,
  };
  public tickerInput!: HTMLInputElement;
  public showAsInput!: HTMLInputElement;
  public typeInput!: HTMLInputElement;
  public regionRadio!: HTMLDivElement;
  public currencyRadio!: HTMLDivElement;
  public showIconRadio!: HTMLDivElement;
  public frequencyInput!: HTMLInputElement;
  public customFrequencyInput!: HTMLInputElement;
  public customFrequencyWrapperElement!: HTMLDivElement;
  public showTotalRadio!: HTMLDivElement;
  public totalAmountInput!: HTMLInputElement;
  public totalAmountWrapperElement!: HTMLDivElement;
  public avgPriceInput!: HTMLInputElement;
  public avgPriceWrapperElement!: HTMLDivElement;
  public risingColorInput!: HTMLInputElement;
  public fallingColorInput!: HTMLInputElement;
  public showGradientRadio!: HTMLDivElement;
  public saveBtn!: HTMLButtonElement;
  public getCheckedValue!: (ele: HTMLDivElement) => string | null; // Adjusted the type definition
  public setCheckedValue!: (ele: HTMLDivElement, value: string) => void;

  handleDidConnectToSocket(): void {
    // Set up your HTML event handlers here
    this.tickerInput = document.querySelector('#ticker') as HTMLInputElement;
    this.showAsInput = document.querySelector('#show_as') as HTMLInputElement;
    this.typeInput = document.querySelector('#type') as HTMLInputElement;
    this.regionRadio = document.querySelector(
      '#region_radio',
    ) as HTMLDivElement;
    this.currencyRadio = document.querySelector(
      '#currency_radio',
    ) as HTMLDivElement;
    this.showIconRadio = document.querySelector(
      '#show_icon_radio',
    ) as HTMLDivElement;
    this.frequencyInput = document.querySelector(
      '#frequency',
    ) as HTMLInputElement;
    this.customFrequencyInput = document.querySelector(
      '#custom_frequency',
    ) as HTMLInputElement;
    this.customFrequencyWrapperElement = document.querySelector(
      '#custom_frequency_wrapper',
    ) as HTMLDivElement;
    this.showTotalRadio = document.querySelector(
      '#total_radio',
    ) as HTMLInputElement;
    this.totalAmountInput = document.querySelector(
      '#total_amount',
    ) as HTMLInputElement;
    this.totalAmountWrapperElement = document.querySelector(
      '#total_amount_wrapper',
    ) as HTMLDivElement;
    this.avgPriceInput = document.querySelector(
      '#avg_price',
    ) as HTMLInputElement;
    this.avgPriceWrapperElement = document.querySelector(
      '#avg_price_wrapper',
    ) as HTMLDivElement;
    this.risingColorInput = document.querySelector(
      '#rising-color',
    ) as HTMLInputElement;
    this.fallingColorInput = document.querySelector(
      '#falling-color',
    ) as HTMLInputElement;
    this.showGradientRadio = document.querySelector(
      '#gradient_radio',
    ) as HTMLDivElement;
    this.saveBtn = document.querySelector('#save') as HTMLButtonElement;

    this.saveBtn.disabled = false;

    // Function to get the value of the checked radio button within the specified div
    this.getCheckedValue = function (ele: HTMLDivElement) {
      const checkedRadio = ele.querySelector(
        'input[type="radio"]:checked',
      ) as HTMLInputElement;
      return checkedRadio ? checkedRadio.value : null;
    };

    // Function to set the value of the checked radio button within the specified div
    this.setCheckedValue = (ele: HTMLDivElement, value: string) => {
      const radio = ele.querySelector(
        `input[value="${value}"]`,
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

      const showTotalVal = this.getCheckedValue(this.showTotalRadio) === 'true';

      // Handle custom frequency
      let frequencyValue = this.frequencyInput.value;
      if (frequencyValue === CUSTOM) {
        const customValue = this.customFrequencyInput.value;
        if (!customValue || parseFloat(customValue) <= 0) {
          alert('Please enter a valid custom frequency in seconds');
          return;
        }
        frequencyValue = customValue;
      }

      this.setSettings({
        ticker: this.tickerInput.value,
        showAs: this.showAsInput.value,
        type: this.typeInput.value as QuoteTypes,
        region: this.getCheckedValue(this.regionRadio),
        showIcon: this.getCheckedValue(this.showIconRadio) === 'true',
        frequency: frequencyValue,
        showTotal: showTotalVal,
        totalAmount:
          this.totalAmountInput.value === '' || !showTotalVal
            ? 0
            : parseFloat(this.totalAmountInput.value),
        avgPrice:
          this.avgPriceInput.value === '' || !showTotalVal
            ? 0
            : parseFloat(this.avgPriceInput.value),
        risingColor: this.risingColorInput.value,
        fallingColor: this.fallingColorInput.value,
        currency: this.getCheckedValue(this.currencyRadio) as Currency,
        showGradient: this.getCheckedValue(this.showGradientRadio) === 'true',
      });
    };

    document.querySelectorAll<HTMLElement>('[data-url]').forEach((node) => {
      node.onclick = () => {
        if (node.dataset.url) {
          this.openURL(node.dataset.url);
        }
      };
    });

    // Show or hide region and currency radio groups based on current type setting
    this.typeInput.addEventListener('change', () => {
      if (this.typeInput.value === QuoteTypes.STOCK) {
        this.regionRadio.style.display = 'flex';
      } else {
        this.regionRadio.style.display = 'none';
      }

      // Show currency selection only for crypto
      if (this.typeInput.value === QuoteTypes.CRYPTO) {
        this.currencyRadio.style.display = 'flex';
      } else {
        this.currencyRadio.style.display = 'none';
      }
    });

    // Initialize the region and currency radio groups based on the current type setting
    if (this.settings.type === QuoteTypes.STOCK) {
      this.regionRadio.style.display = 'flex';
    }

    if (this.settings.type === QuoteTypes.CRYPTO) {
      this.currencyRadio.style.display = 'flex';
    }

    // Show or hide custom frequency input based on frequency setting
    this.frequencyInput.addEventListener('change', () => {
      if (this.frequencyInput.value === CUSTOM) {
        this.customFrequencyWrapperElement.style.display = 'flex';
        // Set default value if empty
        if (!this.customFrequencyInput.value) {
          this.customFrequencyInput.value = '10';
        }
      } else {
        this.customFrequencyWrapperElement.style.display = 'none';
      }
    });

    // Show or hide total amount based on show total setting
    this.showTotalRadio
      .querySelectorAll<HTMLInputElement>('input[name="total-radio"]')
      .forEach((el) => {
        el.addEventListener('change', (e) => {
          let element = e.target as HTMLInputElement;
          if (element.checked && element.value === 'true') {
            this.totalAmountWrapperElement.style.display = 'flex';
            this.avgPriceWrapperElement.style.display = 'flex';
          } else if (element.checked) {
            this.totalAmountWrapperElement.style.display = 'none';
            this.avgPriceWrapperElement.style.display = 'none';
          }
        });
      });

    if (this.settings.showTotal) {
      this.totalAmountWrapperElement.style.display = 'flex';
      this.avgPriceWrapperElement.style.display = 'flex';
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
    this.setCheckedValue(this.currencyRadio, this.settings.currency);
    this.setCheckedValue(this.showIconRadio, this.settings.showIcon.toString());

    // Handle frequency: if it's a custom numeric value (not a predefined option), set dropdown to "custom"
    const frequency = this.settings.frequency ?? ON_PUSH;

    // Get predefined frequency values from the select options (excluding custom)
    const predefinedFrequencies = Array.from(
      this.frequencyInput.querySelectorAll('option'),
    )
      .map((option) => option.value)
      .filter((value) => value !== CUSTOM);

    if (predefinedFrequencies.includes(frequency)) {
      this.frequencyInput.value = frequency;
      this.customFrequencyWrapperElement.style.display = 'none';
    } else {
      // It's a custom numeric value
      this.frequencyInput.value = CUSTOM;
      this.customFrequencyInput.value = frequency;
      this.customFrequencyWrapperElement.style.display = 'flex';
    }

    this.setCheckedValue(
      this.showTotalRadio,
      this.settings.showTotal.toString(),
    );
    this.totalAmountInput.value = this.settings.totalAmount.toString();
    this.avgPriceInput.value = this.settings.avgPrice
      ? this.settings.avgPrice.toString()
      : '';
    this.risingColorInput.value =
      this.settings.risingColor ?? ImgState.increasing;
    this.fallingColorInput.value =
      this.settings.fallingColor ?? ImgState.decreasing;
    this.setCheckedValue(
      this.showGradientRadio,
      this.settings.showGradient.toString(),
    );
    this.typeInput.value = this.settings.type;
    // Show or hide region radio group based on current type setting
    if (this.settings.type === QuoteTypes.STOCK) {
      this.regionRadio.style.display = 'flex';
    } else {
      this.regionRadio.style.display = 'none';
    }

    // Show or hide currency radio group based on current type setting
    if (this.settings.type === QuoteTypes.CRYPTO) {
      this.currencyRadio.style.display = 'flex';
    } else {
      this.currencyRadio.style.display = 'none';
    }
    if (this.settings.showTotal) {
      this.totalAmountWrapperElement.style.display = 'flex';
      this.avgPriceWrapperElement.style.display = 'flex';
    } else {
      this.totalAmountWrapperElement.style.display = 'none';
      this.avgPriceWrapperElement.style.display = 'none';
    }
  }
}

const inspector = new DefaultPropertyInspector({ plugin });

inspector.run();
