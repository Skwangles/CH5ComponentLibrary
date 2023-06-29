import { ICh5Common } from "../../_interfaces";
import { ICh5SliderButtonAttributes } from "./i-ch5-slider-button-attributes";

/**
 * @name Ch5 Slider Button
 * @isattribute false
 * @tagName ch5-slider-button
 * @role slider-button
 * @description Ch5 Slider Button tag provide the ability to set on/off buttons of the advance slider.
 * @componentVersion 2.4.0
 * @childElements
 * [
 *     {
 *      "tagName": "ch5-slider-button-label",
 *      "optional": true,
 *      "childElements": [
 *        {
 *          "tagName": "template",
 *          "optional": false,
 *          "childElements": []
 *        }
 *      ]
 *    }
 * ]
 * @documentation
 * [
 *   "`ch5-slider-button` element",
 *   "***",
 *   "Ch5 Slider Button tag provide the ability to set on/off buttons of the advance slider."
 * ]
 * @snippets
 * [
 *  {
 *    "prefix": "ch5-slider-button:blank",
 *     "description": "Crestron Slider Button",
 *     "body": [
 *       "<ch5-slider-button>",
 *       "</ch5-slider-button>$0"
 *     ]
 *   },
 *   {
 *     "prefix": "ch5-slider-button:all-attributes",
 *     "description": "Crestron Slider Button (All Attributes)",
 *     "body": [
 *       "<ch5-slider-button id=\"ch5-slider-button_${1:id}\"",
 *       "\tkey=\"${2:}\"",
 *       "\tlabel=\"${3:}\"",
 *       "\ticonClass=\"${4:}\"",
 *       "\ticonUrl=\"${5:}\"",
 *       "\tsendEventOnClick=\"${6:}\"",
 *       "\treceiveStateLabel=\"${7:}\"",
 *       "\treceiveStateIconClass=\"${8:}\"",
 *       "\treceiveStateIconUrl=\"${9:}\">",
 *       "</ch5-slider-button>$0"
 *       ]
 *    },
 *    {
 *      "prefix": "ch5-slider-button:default",
 *      "description": "Crestron Slider Button (default)",
 *      "body": [
 *       "<ch5-slider-button id=\"ch5-slider-button_${1:id}\"",
 *       "\tkey=\"${2:on}\"",
 *       "\tlabel=\"${3:}\">",
 *       "<ch5-slider-button>$0"
 *       ]
 *    }
 *  ]
 */
export interface ICh5SliderButtonDocumentation extends ICh5SliderButtonAttributes {

}