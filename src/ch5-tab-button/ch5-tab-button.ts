import { Ch5SignalAttributeRegistry, Ch5SignalElementAttributeRegistryEntries } from "../ch5-common/ch5-signal-attribute-registry";
import { Ch5ButtonListBase } from "../ch5-button-list/base-classes/ch5-button-list-base";
import { Ch5GenericListAttributes } from "../ch5-generic-list-attributes/ch5-generic-list-attributes";
import { Ch5Properties } from "../ch5-core/ch5-properties";
import { ICh5PropertySettings } from "../ch5-core/ch5-property";
export class Ch5TabButton extends Ch5ButtonListBase {

  //#region Variables

  public static ELEMENT_NAME = 'ch5-tab-button';

  public static readonly SIGNAL_ATTRIBUTE_TYPES: Ch5SignalElementAttributeRegistryEntries = {
    ...Ch5GenericListAttributes.SIGNAL_ATTRIBUTE_TYPES,
  };

  public static readonly COMPONENT_PROPERTIES: ICh5PropertySettings[] = [
    {
      default: 3,
      name: "numberOfItems",
      removeAttributeOnNull: true,
      type: "number",
      valueOnAttributeEmpty: 3,
      numberProperties: {
        min: 2,
        max: 15,
        conditionalMin: 2,
        conditionalMax: 15,
        conditionalMinValue: 2,
        conditionalMaxValue: 15
      },
      isObservableProperty: true
    }
  ];

  private _ch5PropertiesTabButton: Ch5Properties;

  //#endregion

  //#region Getters and Setters

  public set numberOfItems(value: number) {
    this._ch5PropertiesTabButton.set<number>("numberOfItems", value, () => {
      this.tabButtonDisplay();
    });
  }
  public get numberOfItems(): number {
    return this._ch5PropertiesTabButton.get<number>("numberOfItems");
  }

  public set receiveStateNumberOfItems(value: string) {
    // overriding the base class set receiveStateNumberOfItems
  }
  public get receiveStateNumberOfItems(): string {
    return this._ch5PropertiesTabButton.get<string>('receiveStateNumberOfItems');
  }

  //#endregion

  //#region Static Methods

  public static registerCustomElement() {
    if (typeof window === "object"
      && typeof window.customElements === "object"
      && typeof window.customElements.define === "function"
      && window.customElements.get(Ch5TabButton.ELEMENT_NAME) === undefined) {
      window.customElements.define(Ch5TabButton.ELEMENT_NAME, Ch5TabButton);
    }
  }

  public static registerSignalAttributeTypes() {
    Ch5SignalAttributeRegistry.instance.addElementAttributeEntries(Ch5TabButton.ELEMENT_NAME, Ch5TabButton.SIGNAL_ATTRIBUTE_TYPES);
  }

  //#endregion

  //#region Component Lifecycle

  constructor() {
    super();
    this.primaryCssClass = Ch5TabButton.ELEMENT_NAME;
    this._ch5PropertiesTabButton = new Ch5Properties(this, Ch5TabButton.COMPONENT_PROPERTIES);
  }

  public connectedCallback() {
    super.connectedCallback();

    // preset attributes
    this.scrollbar = false;
    this.endless = false;
    this.scrollToPosition = 0;
    this.receiveStateScrollToPosition = "";
    this.rows = 1;
    this.columns = 1;
    this.stretch = "both";
    this.buttonCheckboxShow = false;
    this.receiveStateNumberOfItems = "";
  }

  public static get observedAttributes() {
    const availableAttributes: string[] = super.observedAttributes;
    // Remove attributes that should not follow changes to DOM
    availableAttributes.splice(availableAttributes.indexOf("scrollbar"), 1);
    availableAttributes.splice(availableAttributes.indexOf("endless"), 1);
    availableAttributes.splice(availableAttributes.indexOf("scrollToPosition"), 1);
    availableAttributes.splice(availableAttributes.indexOf("receiveStateScrollToPosition"), 1);
    availableAttributes.splice(availableAttributes.indexOf("rows"), 1);
    availableAttributes.splice(availableAttributes.indexOf("columns"), 1);
    availableAttributes.splice(availableAttributes.indexOf("buttonCheckboxShow"), 1);
    availableAttributes.splice(availableAttributes.indexOf("buttonCheckboxPosition"), 1);
    availableAttributes.splice(availableAttributes.indexOf("receiveStateNumberOfItems"), 1);
    return availableAttributes;
  }

  public buttonModeHelper() {
    // override button list buttonModeHelper method
  }
  
  public initScrollbar() {
    // override button list initScrollBar()
  }

  public handleScrollbar() {
    // override button list handleScrollbar()
  }

  public handleRowsAndColumn() {
    // override button list handleRowsAndColumn()
  }
  
  public buttonDisplay() {
    this.tabButtonDisplay();
  }

  //#endregion

  //#region Protected / Private Methods

  public initCssClass() {
    this.logger.start('UpdateCssClass');
    this._elContainer.classList.add(this.nodeName.toLowerCase() + Ch5ButtonListBase.COMPONENT_DATA.ORIENTATION.classListPrefix + this.orientation);
    this.logger.stop();
  }

  //#endregion

}

Ch5TabButton.registerCustomElement();
Ch5TabButton.registerSignalAttributeTypes();



