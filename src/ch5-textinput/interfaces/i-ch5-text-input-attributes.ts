// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { ICh5CommonInputAttributes } from "../../ch5-common-input/interfaces/i-ch5-common-input-attributes";
import { TCh5TextInputStretch,
          TCh5TextInputSize,
          TCh5TextInputType,
          TCh5TextInputTextTransform,
          TCh5TextInputIconPosition
} from "./index";

/**
 * @ignore
 */
export interface ICh5TextInputAttributes extends ICh5CommonInputAttributes {

  /**
   * @documentation
   * [
   *  "`mask` attribute",
   *  "***",
   * "The background pattern that will be present when the input is focused. ",
   * "The following combination of prebuilt definitions are permitted: ",
   * "a - alpha caracter ",
   * "9 - numeric character ",
   * "* - alphanumeric character"
   * ]
   * @name mask
   */
  mask: string;

  /**
   * @documentation
   * [
   * "`iconClass` attribute",
   * "***",
   * "The icon to be shown. Its either prefixed or suffixed based on the iconposition attribute."
   * ]
   * @name iconclass
   * @deprecated {
   * "version": "1.0.0",
   * "description": "This attribute is deprecated, please use 'icon' attribute."
   * }
   */
  iconClass: string;

  /**
   * @documentation
   * [
   * "`icon` attribute",
   * "***",
   * "The icon to be shown. Its either prefixed or suffixed based on the iconposition attribute."
   * ]
   * @name icon
   */
   icon: string;

  /**
   * @documentation
   * [
   * "`label` attribute",
   * "***",
   * "Provides the label for the input on left top corner of the control."
   * ]
   * @name label
   */
  label: string;

  /**
   * @documentation
   * [
   * "`placeholder` attribute",
   * "***",
   * "Provides the placeholder for the input. This shares the default behavior of the input HMTL element."
   * ]
   * @name placeholder
   */
  placeholder: string;

  /**
   * @documentation
   * [
   * "`iconposition` attribute",
   * "***",
   * "The default value is 'first'. Valid values: 'first' and 'last'. ",
   * "If the direction attribute is 'ltr', as will be typical in locales with a left-to-right language ",
   * "direction, 'first' is equivalent to the icon being placed on the left and the text on the ",
   * "right. ",
   * "Conversely, if the direction attribute is 'rtl', first' would place the icon on the ",
   * "right and the label to its left. The Value of 'last' is ",
   * "the opposite of 'first'."
   * ]
   * @name iconposition
   * @default first
   */
  iconPosition: TCh5TextInputIconPosition;

  /**
   * @documentation
   * [
   * "`type` attribute",
   * "***",
   * "The default value is text. ",
   * "The type of the input."
   * ]
   * @name type
   * @default text
   */
  inputType: TCh5TextInputType;

  /**
   * @documentation
   * [
   * "`minlength` attribute",
   * "***",
   * "The default value is 0. ",
   * "Applicable only in feedbackmode='submit'. The minimum length of the attribute."
   * ]
   * @name minlength
   * @default 0
   * @limits [{"min": 0, "max": 99}]
   */
  minLength: number;

  /**
   * @documentation
   * [
   * "`maxlength` attribute",
   * "***",
   * "The default value is 0. ",
   * "Applicable only in feedbackmode='submit'. The maximum length of the attribute"
   * ]
   * @name maxlength
   * @default 0
   * @limits [{"min": 0, "max": 99}]
   */
  maxLength: number;

  /**
   * @documentation
   * [
   * "`minvalue` attribute",
   * "***",
   * "The default value is 0. ",
   * "Applicable only for type=numeric and feedbackmode='submit'. ",
   * "The field will result in an error if the value supplied by user is less than value of the attribute."
   * ]
   * @name minvalue
   * @default 0
   * @limits [{"min": 0, "max": 99}]
   */
  minValue: number;

  /**
   * @documentation
   * [
   * "`maxvalue` attribute",
   * "***",
   * "Applicable only for type=numeric and feedbackmode='submit'. ",
   * "The default value is 0. ",
   * "The field will result in an error if the value supplied by user is greater than value of ",
   * "the attribute."
   * ]
   * @name maxvalue
   * @default 0
   * @limits [{"min": 0, "max": 99}]
   */
  maxValue: number;

  /**
   * @documentation
   * [
   * "`size` attribute",
   * "***",
   * "The default value is 'regular'. Valid values: 'regular',  'x-small', 'small', 'large' and 'x-large'. ",
   * "Sets the relative size of this component."
   * ]
   * @name size
   * @default regular
   */
  size: TCh5TextInputSize;

  /**
   * @documentation
   * [
   * "`stretch` attribute",
   * "***",
   * "The default value is 'fixed'. Valid values: 'fixed', 'width', and 'content'.",
   * "Sets the width of the input.",
   * "Fixed - fixed position (from CSS classes) ",
   * "Width - Width of the parent content ",
   * "Content - Width will be equal to the content width"
   * ]
   * @name stretch
   * @default fixed
   */
  stretch: TCh5TextInputStretch;

  /**
   * @documentation
   * [
   * "`text-transform` attribute",
   * "***",
   * "The default value is 'none'. Only used for type=text. ",
   * "Valid values: ",
   * "'capitalize' – Makes all first characters of each word uppercase ",
   * "'uppercase' – Makes all characters uppercase ",
   * "'lowercase' – Makes all characters lowercase ",
   * "'none' – Does not change the input"
   * ]
   * @name text-transform
   * @default none
   */
  textTransform: TCh5TextInputTextTransform;

  /**
   * @documentation
   * [
   * "`scaling` attribute",
   * "***",
   * "The default value is false. ",
   * "Scales the input font size when it reaches the edge."
   * ]
   * @name scaling
   * @default false
   */
  scaling: boolean;

  /**
   * @documentation
   * [
   * "`receivestatefocus` attribute",
   * "***",
   * "When focused, send true. When unfocusesd, send false."
   * ]
   * @name receivestatefocus
   * @join {"direction": "state", "isContractName": true, "stringJoin": 1}
   */
  receiveStateFocus: string;

  /**
   * @documentation
   * [
   * "`receivestatevalue` attribute",
   * "***",
   * "When recevied, changes the value of the text input field."
   * ]
   * @name receivestatevalue
   * @join {"direction": "state", "isContractName": true, "stringJoin": 1}
   */
  receiveStateValue: string;

  /**
   * @documentation
   * [
   * "`sendeventonchange` attribute",
   * "***",
   * "Sends an event on value change."
   * ]
   * @name sendeventonchange
   * @join {"direction": "event", "isContractName": true, "stringJoin": 1}
   */
  sendEventOnChange: string;

  /**
   * @documentation
   * [
   * "`sendeventonfocus` attribute",
   * "***",
   * "Sends an event on focus."
   * ]
   * @name sendeventonfocus
   * @join {"direction": "event", "isContractName": true, "stringJoin": 1}
   */
  sendEventOnFocus: string;

  /**
   * @documentation
   * [
   * "`sendeventonblur` attribute",
   * "***",
   * "Sends an event on blur."
   * ]
   * @name sendeventonblur
   * @join {"direction": "event", "isContractName": true, "stringJoin": 1}
   */
  sendEventOnBlur: string;
}
