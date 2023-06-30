// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5Common } from "../ch5-common/ch5-common";
import { subscribeState } from "../ch5-core";
import { Ch5SignalFactory } from "../ch5-core/index";
import { Ch5RoleAttributeMapping } from "../utility-models/ch5-role-attribute-mapping";
import { Ch5SignalAttributeRegistry, Ch5SignalElementAttributeRegistryEntries } from "../ch5-common/ch5-signal-attribute-registry";
import { TCh5VideoAspectRatio, TCh5VideoSourceType, TCh5VideoSize, } from './interfaces/t-ch5-video';
import { ICh5VideoAttributes } from './interfaces/i-ch5-video-attributes';
import { Ch5Properties } from "../ch5-core/ch5-properties";
import { ICh5PropertySettings } from "../ch5-core/ch5-property";
import { Ch5CoreIntersectionObserver } from "../ch5-core/ch5-core-intersection-observer";
import { CH5VideoUtils } from "./ch5-video-utils";
import { ICh5VideoPublishEvent, ITouchOrdinates, TDimension, TMultiVideoSignalName, TVideoResponse, TVideoTouchManagerParams } from "./interfaces";
import { publishEvent } from '../ch5-core/utility-functions/publish-signal';
import { ICh5VideoBackground } from "./interfaces";
import { Ch5Background } from "../ch5-background";
import { Ch5VideoSnapshot } from "./ch5-video-snapshot";
import { Ch5VideoTouchManager } from "./ch5-video-touch-manager";
import _ from "lodash";

export class Ch5Video extends Ch5Common implements ICh5VideoAttributes {

  // #region Variables

  public static readonly SVG_ICONS = {
    FULLSCREEN_ICON: '<svg xmlns="http://www.w3.org/2000/svg" class="svgIconStyle" class="svgIconStyle" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
  };

  public static readonly ASPECT_RATIO: TCh5VideoAspectRatio[] = ['16:9', '4:3'];
  public static readonly SOURCE_TYPE: TCh5VideoSourceType[] = ['Network', 'HDMI', 'DM'];
  public static readonly SIZE: TCh5VideoSize[] = ['regular', 'x-small', 'small', 'large', 'x-large', 'xx-large'];
  public static readonly COMPONENT_DATA: any = {
    ASPECT_RATIO: {
      default: Ch5Video.ASPECT_RATIO[0],
      values: Ch5Video.ASPECT_RATIO,
      key: 'aspectRatio',
      attribute: 'aspectRatio',
      classListPrefix: '--aspect-ratio-'
    },
    SIZE: {
      default: Ch5Video.SIZE[0],
      values: Ch5Video.SIZE,
      key: 'size',
      attribute: 'size',
      classListPrefix: '--size-'
    }
  };
  public static readonly SIGNAL_ATTRIBUTE_TYPES: Ch5SignalElementAttributeRegistryEntries = {
    ...Ch5Common.SIGNAL_ATTRIBUTE_TYPES,
    receivestateplay: { direction: "state", booleanJoin: 1, contractName: true },
    receivestateselect: { direction: "state", numericJoin: 1, contractName: true },
    receivestateurl: { direction: "state", stringJoin: 1, contractName: true },
    receivestatesourcetype: { direction: "state", stringJoin: 1, contractName: true },
    receivestateuserid: { direction: "state", stringJoin: 1, contractName: true },
    receivestatepassword: { direction: "state", stringJoin: 1, contractName: true },
    receivestatesnapshoturl: { direction: "state", stringJoin: 1, contractName: true },
    receivestatesnapshotrefreshrate: { direction: "state", numericJoin: 1, contractName: true },
    receivestatesnapshotuserid: { direction: "state", stringJoin: 1, contractName: true },
    receivestatesnapshotpassword: { direction: "state", stringJoin: 1, contractName: true },
    receivestatevideocount: { direction: "state", numericJoin: 1, contractName: true },

    sendeventonclick: { direction: "event", booleanJoin: 1, contractName: true },
    sendeventselectionchange: { direction: "event", numericJoin: 1, contractName: true },
    sendeventselectionsourcetype: { direction: "event", stringJoin: 1, contractName: true },
    sendeventselectionurl: { direction: "event", stringJoin: 1, contractName: true },
    sendeventsnapshoturl: { direction: "event", stringJoin: 1, contractName: true },
    sendeventstate: { direction: "event", numericJoin: 1, contractName: true },
    sendeventerrorcode: { direction: "event", numericJoin: 1, contractName: true },
    sendeventerrormessage: { direction: "event", stringJoin: 1, contractName: true },
    sendeventretrycount: { direction: "event", numericJoin: 1, contractName: true },
    sendeventresolution: { direction: "event", stringJoin: 1, contractName: true },
    sendeventsnapshotstatus: { direction: "event", numericJoin: 1, contractName: true },
    sendeventsnapshotlastupdatetime: { direction: "event", stringJoin: 1, contractName: true }
  };

  public static readonly COMPONENT_PROPERTIES: ICh5PropertySettings[] = [
    {
      default: "",
      name: "indexId",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: Ch5Video.ASPECT_RATIO[0],
      enumeratedValues: Ch5Video.ASPECT_RATIO,
      name: "aspectRatio",
      removeAttributeOnNull: true,
      type: "enum",
      valueOnAttributeEmpty: Ch5Video.ASPECT_RATIO[0],
      isObservableProperty: true
    },
    {
      default: false,
      name: "stretch",
      removeAttributeOnNull: true,
      type: "boolean",
      valueOnAttributeEmpty: false,
      isObservableProperty: true
    },
    {
      default: "",
      name: "url",
      nameForSignal: "receiveStateURL",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: Ch5Video.SOURCE_TYPE[0],
      enumeratedValues: Ch5Video.SOURCE_TYPE,
      name: "sourceType",
      removeAttributeOnNull: true,
      nameForSignal: "receiveStateSourceType",
      type: "enum",
      valueOnAttributeEmpty: Ch5Video.SOURCE_TYPE[0],
      isObservableProperty: true
    },
    {
      default: "",
      name: "userId",
      nameForSignal: "receiveStateUserId",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      name: "password",
      nameForSignal: "receiveStatePassword",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      name: "snapshotURL",
      nameForSignal: "receiveStateSnapshotURL",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: 5,
      name: "snapshotRefreshRate",
      removeAttributeOnNull: true,
      nameForSignal: "receiveStateSnapshotRefreshRate",
      type: "number",
      valueOnAttributeEmpty: null,
      numberProperties: {
        min: 0,
        max: 60,
        conditionalMin: 0,
        conditionalMax: 60,
        conditionalMinValue: 0,
        conditionalMaxValue: 60
      },
      isObservableProperty: true
    },
    {
      default: "",
      name: "snapshotUserId",
      nameForSignal: "receiveStateSnapshotUserId",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      name: "snapshotPassword",
      nameForSignal: "receiveStateSnapshotPassword",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: Ch5Video.SIZE[0],
      enumeratedValues: Ch5Video.SIZE,
      name: "size",
      removeAttributeOnNull: true,
      type: "enum",
      valueOnAttributeEmpty: Ch5Video.SIZE[0],
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStatePlay",
      signalType: "boolean",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: true,
      name: "show",
      nameForSignal: "receiveStateShow",
      removeAttributeOnNull: true,
      type: "boolean",
      valueOnAttributeEmpty: true,
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateShow",
      signalType: "boolean",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateSelect",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateURL",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateSourceType",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateUserId",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStatePassword",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateSnapshotURL",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateSnapshotRefreshRate",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateSnapshotUserId",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateSnapshotPassword",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "receiveStateVideoCount",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventOnClick",
      signalType: "boolean",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventSelectionChange",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventSelectionSourceType",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventSelectionURL",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventSnapshotURL",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventState",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventErrorCode",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventErrorMessage",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventRetryCount",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventResolution",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventSnapshotStatus",
      signalType: "number",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
    {
      default: "",
      isSignal: true,
      name: "sendEventSnapshotLastUpdateTime",
      signalType: "string",
      removeAttributeOnNull: true,
      type: "string",
      valueOnAttributeEmpty: "",
      isObservableProperty: true
    },
  ];

  public static readonly ELEMENT_NAME = 'ch5-video';

  public primaryCssClass = 'ch5-video';

  private _ch5Properties: Ch5Properties;
  private _elContainer: HTMLElement = {} as HTMLElement;
  private _fullScreenIcon: HTMLElement = {} as HTMLElement;

  private responseObj: TVideoResponse = {} as TVideoResponse;
  private sizeObj: TDimension = { width: 0, height: 0 };
  private shellCh5Background: Ch5Background | null = document.getElementById('template-content-background') as Ch5Background;
  private parentCh5Background: Ch5Background | null = null;

  private readonly INTERSECTION_RATIO_VALUE: number = 0.98;

  private playValue: boolean = true;
  private lastRequestStatus: string = '';
  private isVideoReady: boolean = false;
  private lastResponseStatus: string = '';
  private oldResponseStatus: string = '';
  private oldResponseId: number = 0;

  private orientationChanged: boolean = false;
  private isFullScreen: boolean = false;
  private isAlphaBlend: boolean = true;
  private isSwipeDebounce: any;
  private _wasAppBackGrounded: boolean = false;
  private isVideoPublished = false;
  private controlTimer: any;
  private snapshotImage = new Ch5VideoSnapshot();
  private videoErrorMessages = new Map<number, string>();
  private maxVideoCount = 1;
  private selectedVideo = 0;
  private retryCount = 0;
  public ch5UId: number = 0; // CH5 Unique ID

  // touch specific [params]
  private videoTouchHandler: Ch5VideoTouchManager = {} as Ch5VideoTouchManager;
  private isTouchInProgress: boolean = false;
  private readonly swipeDeltaCheckNum: number = 20;
  private touchCoordinates: ITouchOrdinates = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
  }; // instantiating empty object to proceed

  private multiVideoSignalName: TMultiVideoSignalName = {
    url: '',
    userId: '',
    password: '',
    sourceType: '',
    snapshotURL: '',
    snapshotUserId: '',
    snapshotPassword: '',
    snapshotRefreshRate: ''
  }

  // #endregion

  // #region Getters and Setters

  public set indexId(value: string) {
    this._ch5Properties.set<string>("indexId", value, () => {
      this.handleIndexId();
    });
  }
  public get indexId(): string {
    return this._ch5Properties.get<string>("indexId").trim();
  }

  public set aspectRatio(value: TCh5VideoAspectRatio) {
    this._ch5Properties.set<TCh5VideoAspectRatio>("aspectRatio", value, () => {
      this.handleAspectRatio();
    });
  }
  public get aspectRatio(): TCh5VideoAspectRatio {
    return this._ch5Properties.get<TCh5VideoAspectRatio>("aspectRatio");
  }

  public set stretch(value: boolean) {
    this._ch5Properties.set<boolean>("stretch", value, () => {
      this.handleStretch();
    });
  }
  public get stretch(): boolean {
    return this._ch5Properties.get<boolean>("stretch");
  }

  public set url(value: string) {
    this._ch5Properties.set<string>("url", value, () => {
      this.sendEvent(this.sendEventSelectionURL, this.url);
      this.handleReceiveStateURL();
    });
  }
  public get url(): string {
    return this._ch5Properties.get<string>("url").trim();
  }

  public set sourceType(value: TCh5VideoSourceType) {
    this._ch5Properties.set<TCh5VideoSourceType>("sourceType", value, () => {
      this.sendEvent(this.sendEventSelectionSourceType, this.sourceType);
      this.handleReceiveStateURL();
    });
  }
  public get sourceType(): TCh5VideoSourceType {
    return this._ch5Properties.get<TCh5VideoSourceType>("sourceType");
  }

  public set userId(value: string) {
    this._ch5Properties.set<string>("userId", value, () => {
      this.handleReceiveStateURL();
    });
  }
  public get userId(): string {
    return this._ch5Properties.get<string>("userId").trim();
  }

  public set password(value: string) {
    this._ch5Properties.set<string>("password", value, () => {
      this.handleReceiveStateURL();
    });
  }
  public get password(): string {
    return this._ch5Properties.get<string>("password").trim();
  }

  public set snapshotURL(value: string) {
    this._ch5Properties.set<string>("snapshotURL", value, () => {
      this.sendEvent(this.sendEventSnapshotURL, this.snapshotURL);
      this.validateAndAttachSnapshot();
    });
  }
  public get snapshotURL(): string {
    return this._ch5Properties.get<string>("snapshotURL").trim();
  }

  public set snapshotRefreshRate(value: number) {
    this._ch5Properties.set<number>("snapshotRefreshRate", value, () => {
      this.validateAndAttachSnapshot();
    });
  }
  public get snapshotRefreshRate(): number {
    return this._ch5Properties.get<number>("snapshotRefreshRate");
  }

  public set snapshotUserId(value: string) {
    this._ch5Properties.set<string>("snapshotUserId", value, () => {
      this.validateAndAttachSnapshot();
    });
  }
  public get snapshotUserId(): string {
    return this._ch5Properties.get<string>("snapshotUserId");
  }

  public set snapshotPassword(value: string) {
    this._ch5Properties.set<string>("snapshotPassword", value, () => {
      this.validateAndAttachSnapshot();
    });
  }
  public get snapshotPassword(): string {
    return this._ch5Properties.get<string>("snapshotPassword");
  }

  public set size(value: TCh5VideoSize) {
    this._ch5Properties.set<TCh5VideoSize>("size", value, () => {
      this.handleSize();
    });
  }
  public get size(): TCh5VideoSize {
    return this._ch5Properties.get<TCh5VideoSize>("size");
  }

  public set receiveStatePlay(value: string) {
    this._ch5Properties.set("receiveStatePlay", value, null, (newValue: boolean) => {
      this.handleReceiveStatePlay(newValue);
    });
  }
  public get receiveStatePlay(): string {
    return this._ch5Properties.get<string>('receiveStatePlay');
  }

  public set receiveStateSelect(value: string) {
    this._ch5Properties.set("receiveStateSelect", value, null, (newValue: number) => {
      if (this.selectedVideo === newValue) { return; }
      this.selectedVideo = newValue;
      if (newValue >= 0 && newValue < this.maxVideoCount) {
        this.sendEvent(this.sendEventSelectionChange, this.selectedVideo);
        this.handleReceiveStateSelect(newValue);
      }
    });
  }
  public get receiveStateSelect(): string {
    return this._ch5Properties.get<string>('receiveStateSelect');
  }

  public set receiveStateURL(value: string) {
    this._ch5Properties.set("receiveStateURL", value, null, (newValue: string) => {
      if (this.receiveStateURL.includes(`{{${this.indexId}}}`)) {
        this.receiveStateURL = this.receiveStateURL.replace(`{{${this.indexId}}}`, this.selectedVideo.toString());
      } else {
        this._ch5Properties.setForSignalResponse<string>("url", newValue, () => {
          this.sendEvent(this.sendEventSelectionURL, this.url);
          this.handleReceiveStateURL();
        });
      }
    });
  }
  public get receiveStateURL(): string {
    return this._ch5Properties.get<string>('receiveStateURL');
  }

  public set receiveStateSourceType(value: string) {
    this._ch5Properties.set("receiveStateSourceType", value, null, (newValue: string) => {
      if (this.receiveStateSourceType.includes(`{{${this.indexId}}}`)) {
        this.receiveStateSourceType = this.receiveStateSourceType.replace(`{{${this.indexId}}}`, this.selectedVideo.toString())
      } else {
        this._ch5Properties.setForSignalResponse<string>("sourceType", newValue, () => {
          this.sendEvent(this.sendEventSelectionSourceType, this.sourceType);
          this.handleReceiveStateURL();
        });
      }
    });
  }
  public get receiveStateSourceType(): string {
    return this._ch5Properties.get<string>('receiveStateSourceType');
  }

  public set receiveStateUserId(value: string) {
    this._ch5Properties.set("receiveStateUserId", value, null, (newValue: string) => {
      if (this.receiveStateUserId.includes(`{{${this.indexId}}}`)) {
        this.receiveStateUserId = this.receiveStateUserId.replace(`{{${this.indexId}}}`, this.selectedVideo.toString())
      } else {
        this._ch5Properties.setForSignalResponse<string>("userId", newValue, () => {
          this.handleReceiveStateURL();
        });
      }
    });
  }
  public get receiveStateUserId(): string {
    return this._ch5Properties.get<string>('receiveStateUserId');
  }

  public set receiveStatePassword(value: string) {
    this._ch5Properties.set("receiveStatePassword", value, null, (newValue: string) => {
      if (this.receiveStatePassword.includes(`{{${this.indexId}}}`)) {
        this.receiveStatePassword = this.receiveStatePassword.replace(`{{${this.indexId}}}`, this.selectedVideo.toString())
      } else {
        this._ch5Properties.setForSignalResponse<string>("password", newValue, () => {
          this.handleReceiveStateURL();
        });
      }
    });
  }
  public get receiveStatePassword(): string {
    return this._ch5Properties.get<string>('receiveStatePassword');
  }

  public set receiveStateSnapshotURL(value: string) {
    this._ch5Properties.set("receiveStateSnapshotURL", value, null, (newValue: string) => {
      if (this.receiveStateSnapshotURL.includes(`{{${this.indexId}}}`)) {
        this.receiveStateSnapshotURL = this.receiveStateSnapshotURL.replace(`{{${this.indexId}}}`, this.selectedVideo.toString())
      } else {
        this._ch5Properties.setForSignalResponse<string>("snapshotURL", newValue, () => {
          this.sendEvent(this.sendEventSnapshotURL, this.snapshotURL);
          this.validateAndAttachSnapshot();
        });
      }
    });
  }
  public get receiveStateSnapshotURL(): string {
    return this._ch5Properties.get<string>('receiveStateSnapshotURL');
  }

  public set receiveStateSnapshotRefreshRate(value: string) {
    this._ch5Properties.set("receiveStateSnapshotRefreshRate", value, null, (newValue: number) => {
      if (this.receiveStateSnapshotRefreshRate.includes(`{{${this.indexId}}}`)) {
        this.receiveStateSnapshotRefreshRate = this.receiveStateSnapshotRefreshRate.replace(`{{${this.indexId}}}`, this.selectedVideo.toString());
      } else {
        this._ch5Properties.setForSignalResponse<number>("snapshotRefreshRate", newValue, () => {
          this.validateAndAttachSnapshot();
        });
      }
    });
  }
  public get receiveStateSnapshotRefreshRate(): string {
    return this._ch5Properties.get<string>('receiveStateSnapshotRefreshRate');
  }

  public set receiveStateSnapshotUserId(value: string) {
    this._ch5Properties.set("receiveStateSnapshotUserId", value, null, (newValue: string) => {
      if (this.receiveStateSnapshotUserId.includes(`{{${this.indexId}}}`)) {
        this.receiveStateSnapshotUserId = this.receiveStateSnapshotUserId.replace(`{{${this.indexId}}}`, this.selectedVideo.toString())
      } else {
        this._ch5Properties.setForSignalResponse<string>("snapshotUserId", newValue, () => {
          this.validateAndAttachSnapshot();
        });
      }
    });
  }
  public get receiveStateSnapshotUserId(): string {
    return this._ch5Properties.get<string>('receiveStateSnapshotUserId');
  }

  public set receiveStateSnapshotPassword(value: string) {
    this._ch5Properties.set("receiveStateSnapshotPassword", value, null, (newValue: string) => {
      if (this.receiveStateSnapshotPassword.includes(`{{${this.indexId}}}`)) {
        this.receiveStateSnapshotPassword = this.receiveStateSnapshotPassword.replace(`{{${this.indexId}}}`, this.selectedVideo.toString())
      } else {
        this._ch5Properties.setForSignalResponse<string>("snapshotPassword", newValue, () => {
          this.validateAndAttachSnapshot();
        });
      }
    });
  }
  public get receiveStateSnapshotPassword(): string {
    return this._ch5Properties.get<string>('receiveStateSnapshotPassword');
  }

  public set receiveStateVideoCount(value: string) {
    this._ch5Properties.set("receiveStateVideoCount", value, null, (newValue: number) => {
      if (newValue >= 1 && newValue <= 32) {
        this.maxVideoCount = newValue;
        if (this.selectedVideo >= 0 && this.selectedVideo < this.maxVideoCount) {
          this.handleReceiveStateSelect(this.selectedVideo);
        }
      }
    });
  }
  public get receiveStateVideoCount(): string {
    return this._ch5Properties.get<string>('receiveStateVideoCount');
  }

  public set sendEventOnClick(value: string) {
    this._ch5Properties.set("sendEventOnClick", value);
  }
  public get sendEventOnClick(): string {
    return this._ch5Properties.get<string>('sendEventOnClick');
  }

  public set sendEventSelectionChange(value: string) {
    this._ch5Properties.set("sendEventSelectionChange", value);
  }
  public get sendEventSelectionChange(): string {
    return this._ch5Properties.get<string>('sendEventSelectionChange');
  }

  public set sendEventSelectionSourceType(value: string) {
    this._ch5Properties.set("sendEventSelectionSourceType", value);
  }
  public get sendEventSelectionSourceType(): string {
    return this._ch5Properties.get<string>('sendEventSelectionSourceType');
  }

  public set sendEventSelectionURL(value: string) {
    this._ch5Properties.set("sendEventSelectionURL", value);
  }
  public get sendEventSelectionURL(): string {
    return this._ch5Properties.get<string>('sendEventSelectionURL');
  }

  public set sendEventSnapshotURL(value: string) {
    this._ch5Properties.set("sendEventSnapshotURL", value);
  }
  public get sendEventSnapshotURL(): string {
    return this._ch5Properties.get<string>('sendEventSnapshotURL');
  }

  public set sendEventState(value: string) {
    this._ch5Properties.set("sendEventState", value);
  }
  public get sendEventState(): string {
    return this._ch5Properties.get<string>('sendEventState');
  }

  public set sendEventErrorCode(value: string) {
    this._ch5Properties.set("sendEventErrorCode", value);
  }
  public get sendEventErrorCode(): string {
    return this._ch5Properties.get<string>('sendEventErrorCode');
  }

  public set sendEventErrorMessage(value: string) {
    this._ch5Properties.set("sendEventErrorMessage", value);
  }
  public get sendEventErrorMessage(): string {
    return this._ch5Properties.get<string>('sendEventErrorMessage');
  }

  public set sendEventRetryCount(value: string) {
    this._ch5Properties.set("sendEventRetryCount", value);
  }
  public get sendEventRetryCount(): string {
    return this._ch5Properties.get<string>('sendEventRetryCount');
  }

  public set sendEventResolution(value: string) {
    this._ch5Properties.set("sendEventResolution", value);
  }
  public get sendEventResolution(): string {
    return this._ch5Properties.get<string>('sendEventResolution');
  }

  public set sendEventSnapshotStatus(value: string) {
    this._ch5Properties.set("sendEventSnapshotStatus", value);
  }
  public get sendEventSnapshotStatus(): string {
    return this._ch5Properties.get<string>('sendEventSnapshotStatus');
  }

  public set sendEventSnapshotLastUpdateTime(value: string) {
    this._ch5Properties.set("sendEventSnapshotLastUpdateTime", value);
  }
  public get sendEventSnapshotLastUpdateTime(): string {
    return this._ch5Properties.get<string>('sendEventSnapshotLastUpdateTime');
  }

  public set show(value: boolean) {
    this._ch5Properties.set("show", value, () => {
      this.handleReceiveStateShow();
    });
  }
  public get show(): boolean {
    return this._ch5Properties.get<boolean>('show');
  }

  public set receiveStateShow(value: string) {
    this._ch5Properties.set("receiveStateShow", value, null, (newValue: boolean) => {
      this._ch5Properties.setForSignalResponse<boolean>("show", newValue, () => {
        this.handleReceiveStateShow();
      });
    });
  }
  public get receiveStateShow(): string {
    return this._ch5Properties.get<string>('receiveStateShow');
  }

  // #endregion

  // #region Static Methods

  public static registerSignalAttributeTypes() {
    Ch5SignalAttributeRegistry.instance.addElementAttributeEntries(Ch5Video.ELEMENT_NAME, Ch5Video.SIGNAL_ATTRIBUTE_TYPES);
  }

  public static registerCustomElement() {
    if (typeof window === "object"
      && typeof window.customElements === "object"
      && typeof window.customElements.define === "function"
      && window.customElements.get(Ch5Video.ELEMENT_NAME) === undefined) {
      window.customElements.define(Ch5Video.ELEMENT_NAME, Ch5Video);
    }
  }

  // #endregion

  // #region Component Lifecycle

  public constructor() {
    super();
    this.ignoreAttributes = ['show', 'receiveStateShow'];
    this.logger.start('constructor()', Ch5Video.ELEMENT_NAME);
    if (!this._wasInstatiated) {
      this.createInternalHtml();
    }
    this._wasInstatiated = true;
    this._ch5Properties = new Ch5Properties(this, Ch5Video.COMPONENT_PROPERTIES);
    this.updateCssClass();
    this.setErrorMessages();
    this.handleMultiVideo();
    subscribeState('o', 'Csig.video.response', this._videoResponse.bind(this), this._errorResponse.bind(this));
  }

  public static get observedAttributes(): string[] {
    const inheritedObsAttrs = Ch5Common.observedAttributes;
    const newObsAttrs: string[] = [];
    for (let i: number = 0; i < Ch5Video.COMPONENT_PROPERTIES.length; i++) {
      if (Ch5Video.COMPONENT_PROPERTIES[i].isObservableProperty === true) {
        newObsAttrs.push(Ch5Video.COMPONENT_PROPERTIES[i].name.toLowerCase());
      }
    }
    return inheritedObsAttrs.concat(newObsAttrs);
  }

  public attributeChangedCallback(attr: string, oldValue: string, newValue: string): void {
    this.logger.start("attributeChangedCallback", this.primaryCssClass);
    if (oldValue !== newValue) {
      this.logger.log('ch5-video attributeChangedCallback("' + attr + '","' + oldValue + '","' + newValue + '")');
      const attributeChangedProperty = Ch5Video.COMPONENT_PROPERTIES.find((property: ICh5PropertySettings) => { return property.name.toLowerCase() === attr.toLowerCase() && property.isObservableProperty === true });
      if (attributeChangedProperty) {
        const thisRef: any = this;
        const key = attributeChangedProperty.name;
        thisRef[key] = newValue;
      } else {
        super.attributeChangedCallback(attr, oldValue, newValue);
      }
    }
    this.logger.stop();
  }

  /**
   * Called when the Ch5Video component is first connected to the DOM
   */
  public connectedCallback() {
    this.logger.start('connectedCallback()', Ch5Video.ELEMENT_NAME);
    // WAI-ARIA Attributes
    if (!this.hasAttribute('role')) { this.setAttribute('role', Ch5RoleAttributeMapping.ch5Video); }
    if (this._elContainer.parentElement !== this) { this.appendChild(this._elContainer); }

    this.ch5UId = parseInt(this.getCrId().split('cr-id-')[1], 0);
    this.setAttribute('data-ch5-id', this.getCrId());
    this.attachEventListeners();
    this.initAttributes();
    this.initCommonMutationObserver(this);
    customElements.whenDefined('ch5-video').then(() => {
      this.componentLoadedEvent(Ch5Video.ELEMENT_NAME, this.getCrId());
      this.lastRequestStatus = CH5VideoUtils.VIDEO_ACTION.EMPTY;
      this.isVideoReady = false;
    });
    Ch5CoreIntersectionObserver.getInstance().observe(this, this.videoIntersectionObserver.bind(this));
    this.logger.stop();
  }

  public disconnectedCallback() {
    this.logger.start('disconnectedCallback()');
    this.removeEventListeners();
    this.unsubscribeFromSignals();
    this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.STOP);
    this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.REFILL);
    this.selectedVideo = 0;
    this.maxVideoCount = 1;
    this.logger.stop();
  }

  // #endregion

  // #region Protected / Private Methods

  protected createInternalHtml() {
    this.logger.start('createInternalHtml()');
    this.clearComponentContent();
    this._elContainer = document.createElement('div');
    this._elContainer.classList.add(this.primaryCssClass);

    // Create full screen icon on top right corner of the container
    this._fullScreenIcon = document.createElement("a");
    this._fullScreenIcon.classList.add("full-screen-icon");
    this._fullScreenIcon.classList.add("hide");
    this._fullScreenIcon.innerHTML = Ch5Video.SVG_ICONS.FULLSCREEN_ICON;

    this._elContainer.appendChild(this._fullScreenIcon);
    this._elContainer.appendChild(this.snapshotImage.getImage());
    this.logger.stop();
  }

  protected initAttributes() {
    super.initAttributes();

    const thisRef: any = this;
    for (let i: number = 0; i < Ch5Video.COMPONENT_PROPERTIES.length; i++) {
      if (Ch5Video.COMPONENT_PROPERTIES[i].isObservableProperty === true) {
        if (this.hasAttribute(Ch5Video.COMPONENT_PROPERTIES[i].name.toLowerCase())) {
          const key = Ch5Video.COMPONENT_PROPERTIES[i].name;
          thisRef[key] = this.getAttribute(key);
        }
      }
    }
  }

  protected attachEventListeners() {
    super.attachEventListeners();
    this._elContainer.addEventListener('click', this._manageControls.bind(this));
    this._fullScreenIcon.addEventListener('click', this.toggleFullScreen.bind(this));
    window.addEventListener('resize', this.handleOrientation);
  }

  protected removeEventListeners() {
    super.removeEventListeners();
    this._elContainer.removeEventListener('click', this._manageControls.bind(this));
    this._fullScreenIcon.removeEventListener('click', this.toggleFullScreen.bind(this));
    window.removeEventListener('resize', this.handleOrientation);
  }

  protected unsubscribeFromSignals() {
    super.unsubscribeFromSignals();
    this._ch5Properties.unsubscribe();
  }

  // Clear the content of component in order to avoid duplication of elements
  private clearComponentContent() {
    const containers = this.getElementsByTagName("div");
    Array.from(containers).forEach((container) => {
      container.remove();
    });
  }

  private handleIndexId() {
    if (this.multiVideoSignalName.url.includes(`{{${this.indexId}}}`)) { this.receiveStateURL = this.multiVideoSignalName.url.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
    if (this.multiVideoSignalName.userId.includes(`{{${this.indexId}}}`)) { this.receiveStateUserId = this.multiVideoSignalName.userId.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
    if (this.multiVideoSignalName.password.includes(`{{${this.indexId}}}`)) { this.receiveStatePassword = this.multiVideoSignalName.password.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
    if (this.multiVideoSignalName.snapshotURL.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotURL = this.multiVideoSignalName.snapshotURL.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
    if (this.multiVideoSignalName.snapshotUserId.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotUserId = this.multiVideoSignalName.snapshotUserId.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
    if (this.multiVideoSignalName.snapshotPassword.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotPassword = this.multiVideoSignalName.snapshotPassword.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
    if (this.multiVideoSignalName.snapshotRefreshRate.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotRefreshRate = this.multiVideoSignalName.snapshotRefreshRate.replace(`{{${this.indexId}}}`, this.selectedVideo.toString()) }
  }

  private handleAspectRatio() {
    Array.from(Ch5Video.COMPONENT_DATA.ASPECT_RATIO.values).forEach((e: any) => {
      this._elContainer.classList.remove(this.primaryCssClass + Ch5Video.COMPONENT_DATA.ASPECT_RATIO.classListPrefix + e.replace(':', '-'));
    });
    this._elContainer.classList.add(this.primaryCssClass + Ch5Video.COMPONENT_DATA.ASPECT_RATIO.classListPrefix + this.aspectRatio.replace(':', '-'));
  }

  private handleStretch() {
    if (this.stretch === true) {
      this._elContainer.classList.add(this.primaryCssClass + '--stretch-true');
      this.style.width = '100%';
      this.style.height = '100%';
    } else {
      this._elContainer.classList.remove(this.primaryCssClass + '--stretch-true');
      this.style.removeProperty('width');
      this.style.removeProperty('height');
    }
  }

  private handleSize() {
    Array.from(Ch5Video.COMPONENT_DATA.SIZE.values).forEach((e: any) => {
      this._elContainer.classList.remove(this.primaryCssClass + Ch5Video.COMPONENT_DATA.SIZE.classListPrefix + e);
    });
    this._elContainer.classList.add(this.primaryCssClass + Ch5Video.COMPONENT_DATA.SIZE.classListPrefix + this.size);
  }

  private handleReceiveStatePlay(value: boolean) {
    this.playValue = value;
    if (this.playValue === false) {
      this.snapshotImage.stopLoadingSnapshot();
      this.sendEvent(this.sendEventSnapshotStatus, 0);
      return this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.STOP);
    }
    this.videoIntersectionObserver();
  }

  private handleReceiveStateSelect(select: number) {
    if (this.multiVideoSignalName.url.includes(`{{${this.indexId}}}`)) { this.receiveStateURL = this.multiVideoSignalName.url.replace(`{{${this.indexId}}}`, select.toString()) }
    if (this.multiVideoSignalName.userId.includes(`{{${this.indexId}}}`)) { this.receiveStateUserId = this.multiVideoSignalName.userId.replace(`{{${this.indexId}}}`, select.toString()) }
    if (this.multiVideoSignalName.password.includes(`{{${this.indexId}}}`)) { this.receiveStatePassword = this.multiVideoSignalName.password.replace(`{{${this.indexId}}}`, select.toString()) }
    if (this.multiVideoSignalName.snapshotURL.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotURL = this.multiVideoSignalName.snapshotURL.replace(`{{${this.indexId}}}`, select.toString()) }
    if (this.multiVideoSignalName.snapshotUserId.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotUserId = this.multiVideoSignalName.snapshotUserId.replace(`{{${this.indexId}}}`, select.toString()) }
    if (this.multiVideoSignalName.snapshotPassword.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotPassword = this.multiVideoSignalName.snapshotPassword.replace(`{{${this.indexId}}}`, select.toString()) }
    if (this.multiVideoSignalName.snapshotRefreshRate.includes(`{{${this.indexId}}}`)) { this.receiveStateSnapshotRefreshRate = this.multiVideoSignalName.snapshotRefreshRate.replace(`{{${this.indexId}}}`, select.toString()) }
  }

  private handleReceiveStateURL() {
    if (this.elementIntersectionEntry.intersectionRatio >= this.INTERSECTION_RATIO_VALUE) {
      this.lastResponseStatus = CH5VideoUtils.VIDEO_ACTION.EMPTY;
      this.lastRequestStatus = CH5VideoUtils.VIDEO_ACTION.EMPTY;
      this.isVideoReady = false;
      if (this.url === '') {
        this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.STOP);
        this.snapshotImage.stopLoadingSnapshot();
        this.sendEvent(this.sendEventSnapshotStatus, 0);
      } else {
        this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.START);
      }
    }
  }

  private handleReceiveStateShow() {
    if (this.show === true) {
      this.videoIntersectionObserver();
    } else {
      this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.STOP);
      this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.STOP);
    }
  }

  private updateCssClass() {
    this.logger.start('UpdateCssClass');
    super.updateCssClasses();
    this._elContainer.classList.add(this.primaryCssClass + Ch5Video.COMPONENT_DATA.ASPECT_RATIO.classListPrefix + this.aspectRatio.replace(':', '-'));
    this._elContainer.classList.add(this.primaryCssClass + Ch5Video.COMPONENT_DATA.SIZE.classListPrefix + this.size);
    this.logger.stop();
  }

  protected getTargetElementForCssClassesAndStyle(): HTMLElement {
    return this._elContainer;
  }

  public getCssClassDisabled() {
    return this.primaryCssClass + '--disabled';
  }

  private stopAndRefill() {
    this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.REFILL);
    publishEvent('o', 'Csig.video.request', this.videoStopObjJSON(CH5VideoUtils.VIDEO_ACTION.STOP, this.ch5UId));
  }

  /**
   * When the video element is more than 100% visible the video should start and
   * when the visibility is less than 100% the video should stop playing.
   */
  public videoIntersectionObserver() {
    this.logger.log("videoIntersectionObserver#intersectionRatio -> " + this.elementIntersectionEntry.intersectionRatio);
    if (this.elementIntersectionEntry.intersectionRatio >= this.INTERSECTION_RATIO_VALUE && this.playValue && this.show) {
      this.validateAndAttachSnapshot();
      this.videoInViewPort();
    } else {
      this.videoNotInViewport();
    }
    // Removes or Adds document level touch handlers if in view
    if (this.elementIntersectionEntry.intersectionRatio > 0.1 && this.playValue) {
      this.addTouchEvent();
    } else {
      this.stopAndRefill();
      this.removeTouchEvent();
    }
  }

  private videoInViewPort() {
    this.snapshotImage.startLoadingSnapshot();
    clearTimeout(this.isSwipeDebounce);
    this.isSwipeDebounce = setTimeout(() => {
      this.calculation();
      this.lastResponseStatus = CH5VideoUtils.VIDEO_ACTION.EMPTY;
      this.lastRequestStatus = CH5VideoUtils.VIDEO_ACTION.EMPTY;
      this.isVideoReady = false;
      this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.START);
    }, 300); // reducing this will create a cut at wrong place
  }

  private videoNotInViewport() {
    if (this.isFullScreen || this.isVideoPublished === false) { return; }
    this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.STOP);
    this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.REFILL);
  }

  // Calculate the size and position of the canvas
  private calculation(): void {
    if (!this.isFullScreen) {
      this.sizeObj = {
        width: this._elContainer.getBoundingClientRect().width,
        height: this._elContainer.getBoundingClientRect().height
      };
    }
  }

  private videoStopObjJSON(actionType: string, uId: number): ICh5VideoPublishEvent {
    this.lastRequestStatus = actionType;
    const retObj: any = {
      "action": actionType,
      "id": uId
    };
    this.sendEvent(this.sendEventState, 3);
    // this.logger.log(JSON.stringify(retObj));
    return retObj;
  }

  // Create the Video JSON object to start the video
  public videoStartObjJSON(actionType: string): ICh5VideoPublishEvent {
    let xPosition: number = this._elContainer.getBoundingClientRect().left;
    let yPosition: number = this._elContainer.getBoundingClientRect().top;
    let width: number = this.sizeObj.width;
    let height: number = this.sizeObj.height;

    if (actionType === CH5VideoUtils.VIDEO_ACTION.FULLSCREEN) {
      actionType = CH5VideoUtils.VIDEO_ACTION.RESIZE;
      xPosition = 0;
      yPosition = 0;
      width = window.innerWidth;
      height = window.innerHeight;
      // handling the aspect ratio in full screen video
      if (window.innerWidth < window.innerHeight) {
        if (this.aspectRatio === '4:3') {
          width = window.innerWidth;
          height = (window.innerWidth / 4) * 3;
          yPosition = (window.innerHeight - height) / 2;
        } else {
          width = window.innerWidth;
          height = (window.innerWidth / 16) * 9;
          yPosition = (window.innerHeight - height) / 2;
        }
      } else {
        if (this.aspectRatio === '4:3') {
          height = window.innerHeight;
          width = (window.innerHeight / 3) * 4;
          if (width > window.innerWidth) {
            width = window.innerWidth;
          }
          xPosition = (window.innerWidth - width) / 2;
        } else {
          height = window.innerHeight;
          width = (window.innerHeight / 9) * 16;
          if (width > window.innerWidth) {
            width = window.innerWidth;
          }
          xPosition = (window.innerWidth - width) / 2;
        }
      }
    }

    this.lastRequestStatus = actionType;
    this.clearBackgroundOfVideoWrapper(true); // always clears the background of the video tag to display video behind it
    // any negative values in location object will throw backend error sometimes decimal values are returned by position related functions. Math.ceil is used to avoid this.
    const retObj = {
      action: actionType,
      id: this.ch5UId,
      credentials: {
        userid: this.userId,
        password: this.password
      },
      source: {
        type: this.sourceType,
        url: this.url
      },
      location: {
        top: Math.ceil(yPosition),
        left: Math.ceil(xPosition),
        width: Math.ceil(width),
        height: Math.ceil(height),
        z: 0
      },
      alphablend: this.isAlphaBlend, // optional, default true, false indicates video displayed above the HTML
      starttime: new Date().getMilliseconds(), // milliseconds since 1-1-1970 UTC
      endtime: new Date().getMilliseconds() + 2000, // 2000 msecs later
      timing: "linear" // only linear supported initially
    };

    return retObj;
  }

  private validateVideoUrl(videoUrl: string): boolean {
    return (videoUrl.startsWith('rtsp://') || videoUrl.startsWith('http://') || videoUrl.startsWith('https://'))
  }

  // Publish the video start request
  private _videoStartRequest(actionType: string) {
    if (this.url === '') {
      this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.NOURL);
      return;
    }
    // Invalid URL scenario, validation error                
    if (!this.validateVideoUrl(this.url)) {
      this.sendEvent(this.sendEventErrorMessage, 'Invalid URL');
      this.sendEvent(this.sendEventErrorCode, -9002);
      this.lastResponseStatus = CH5VideoUtils.VIDEO_ACTION.ERROR;
      this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.ERROR);
      return;
    }
    this.isVideoReady = true;
    if (this.responseObj?.id && this.responseObj?.id !== this.ch5UId && this.responseObj?.status === 'started') {
      publishEvent('o', 'Csig.video.request', this.videoStopObjJSON('stop', this.responseObj?.id));
      setTimeout(() => {
        publishEvent('o', 'Csig.video.request', this.videoStartObjJSON(actionType));
      }, 300);
    } else {
      publishEvent('o', 'Csig.video.request', this.videoStartObjJSON(actionType));
    }
  }

  private _videoStopRequest(actionType: string) { // Publish the video stop request
    publishEvent('o', 'Csig.video.request', this.videoStopObjJSON(actionType, this.ch5UId)); // Stop the video immediately
    this.isVideoReady = false;
  }

  // Send event to the backend based on the action Type
  private _publishVideoEvent(actionType: string) {
    // this.responseObj = {} as TVideoResponse; // TODO
    this.isAlphaBlend = !this.isFullScreen;
    this.calculation();
    this.sendEvent(this.sendEventResolution, this.sizeObj.width + "x" + this.sizeObj.height + "@24fps");
    this._clearOldResponseData(); // reset old response, required to check whether the second response is same.
    switch (actionType) {
      case CH5VideoUtils.VIDEO_ACTION.START:
        this.isVideoPublished = true;
        if (!this.isVideoReady && this.lastRequestStatus !== CH5VideoUtils.VIDEO_ACTION.START && this.url &&
          (this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.STOPPED || this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.EMPTY ||
            this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.ERROR || this._wasAppBackGrounded)) {
          this._videoStartRequest(actionType);
        } else {
          this.sendEvent(this.sendEventState, 0);
        }
        break;
      case CH5VideoUtils.VIDEO_ACTION.STOP:
        if (!this.isVideoPublished) { // this flag avoids stop command since no video has started
          return;
        }
        if (this.lastRequestStatus !== CH5VideoUtils.VIDEO_ACTION.STOP && (this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.EMPTY ||
          this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.STARTED || !this.elementIsInViewPort ||
          ((this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.RESIZED || this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.ERROR)))) {
          this._videoStopRequest(actionType);
        }
        break;
      case CH5VideoUtils.VIDEO_ACTION.RESIZE:
        // If the video has already stopped then there is no need to resize.
        if (this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.STOPPED || this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.EMPTY ||
          this.lastRequestStatus === CH5VideoUtils.VIDEO_ACTION.STOP) {
          return;
        }
        this.calculation();
        publishEvent('o', 'Csig.video.request', this.videoStartObjJSON(actionType));
        this.isVideoReady = false;
        break;
      case CH5VideoUtils.VIDEO_ACTION.FULLSCREEN:
        if (this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.STARTED || this.lastResponseStatus === CH5VideoUtils.VIDEO_ACTION.RESIZED) {
          publishEvent('o', 'Csig.video.request', this.videoStartObjJSON(actionType));
          this.isVideoReady = false;
        }
        break;
      default:
        break;
    }
  }

  private _videoResponse(response: TVideoResponse) { // Process the backend response
    if (typeof response === 'string') {
      this.responseObj = JSON.parse(response);
    } else {
      this.responseObj = response;
    }

    const isMyObjectEmpty = !Object.keys(response).length;
    if (this.responseObj.id !== this.ch5UId || isMyObjectEmpty) {
      return;
    }
    if (isMyObjectEmpty) {
      this.isVideoReady = false;
      return;
    }
    // Return if the previous id and status of the response matches with current id and status of the response
    if (this.oldResponseStatus === this.responseObj.status && this.oldResponseId === this.responseObj.id) {
      return;
    }
    // Return if response object id is negative or empty
    if (this.responseObj.id === -1 || !this.responseObj.id) {
      return;
    }
    // Return if the request Id and response Id is not same
    if (this.ch5UId !== this.responseObj.id) {
      return;
    }
    // Return if response status is queued as we do not take any action in UI
    if (this.responseObj.status === 'queued') {
      return;
    }

    // this.logger.log("Video Response : " + JSON.stringify(this.responseObj));

    this.lastResponseStatus = this.responseObj.status.toLowerCase();
    switch (this.responseObj.status.toLowerCase()) {
      case 'started':
        this.ch5BackgroundRequest('started');
        this.sendEvent(this.sendEventState, 2);
        break;
      case 'stopped':
        this.ch5BackgroundRequest('stop');
        this.sendEvent(this.sendEventState, 1);
        break;
      case 'error':
        this.ch5BackgroundRequest('error');
        this.sendEvent(this.sendEventState, 7);
        this.sendEvent(this.sendEventErrorCode, Number(this.responseObj.statuscode));
        this.sendEvent(this.sendEventErrorMessage, this.videoErrorMessages.get(Number(this.responseObj.statuscode)) || 'Unknown Error Message')
        break;
      case 'connecting':
        this.sendEvent(this.sendEventState, 4);
        break;
      case 'retrying':
        this.sendEvent(this.sendEventState, 6);
        this.retryCount = this.retryCount + 1;
        this.sendEvent(this.sendEventRetryCount, this.retryCount);
        break;
      case 'buffering':
        this.sendEvent(this.sendEventState, 5);
        break;
      default:
        this.logger.log('video is in ' + this.responseObj.status.toLowerCase() + ' state')
        break;
    }
  }

  // Call back function if the video response has an error
  private _errorResponse(error: any) {
    this.info("Ch5Video - Error when the video response", error);
  }

  private sendEvent(signalName: string, signalValue: string | boolean | number) {
    if (signalName?.trim().length === 0 || signalName === null || signalName === undefined) { return; }
    switch (typeof signalValue) {
      case 'boolean':
        Ch5SignalFactory.getInstance().getBooleanSignal(signalName)?.publish(true);
        Ch5SignalFactory.getInstance().getBooleanSignal(signalName)?.publish(false);
        break;
      case 'string':
        Ch5SignalFactory.getInstance().getStringSignal(signalName)?.publish(signalValue as string);
        break;
      case 'number':
        Ch5SignalFactory.getInstance().getNumberSignal(signalName)?.publish(signalValue as number)
        break;
    }
  }

  private ch5BackgroundRequest(actionType: string) {
    const nodeList: NodeList = this._elContainer.childNodes;

    switch (actionType) {
      case CH5VideoUtils.VIDEO_ACTION.NOURL:
        this.clearBackgroundOfVideoWrapper(false);
        if (nodeList.length > 1) {
          this._elContainer.childNodes[1].remove();
        }
        this._elContainer.style.borderBottom = '1rem solid #828282'; // Gray color
        break;
      case CH5VideoUtils.VIDEO_ACTION.REFILL:
        this.ch5BackgroundAction(CH5VideoUtils.VIDEO_ACTION.REFILL);
        break;
      case CH5VideoUtils.VIDEO_ACTION.RESIZE:
        this.ch5BackgroundAction(CH5VideoUtils.VIDEO_ACTION.RESIZE);
        break;
      case CH5VideoUtils.VIDEO_ACTION.STARTED:
        this.resetVideoElement();
        this.snapshotImage.stopLoadingSnapshot();
        this.sendEvent(this.sendEventSnapshotStatus, 0);
        this.ch5BackgroundAction(CH5VideoUtils.VIDEO_ACTION.STARTED);
        break;
      case CH5VideoUtils.VIDEO_ACTION.STOP:
        this.resetVideoElement();
        this.ch5BackgroundAction(CH5VideoUtils.VIDEO_ACTION.STOP);
        break;
      case CH5VideoUtils.VIDEO_ACTION.ERROR:
        this._elContainer.style.background = '#000';
        if (nodeList.length > 1) { this._elContainer.childNodes[1].remove(); }
        this._elContainer.style.borderBottom = '1rem solid #CF142B'; // Red color
        this.sendEvent(this.sendEventErrorCode, Number(this.responseObj.statuscode));
        break;
      default:
        // Nothing here as of now
        break;
    }
  }

  // This will call the methods in ch5-background component @param videoInfo send the video id, size and position details
  private ch5BackgroundAction(actionStatus: string) {

    const videoInfo: ICh5VideoBackground = {
      action: actionStatus,
      id: this.getCrId(),
      top: this._elContainer.getBoundingClientRect().top,
      left: this._elContainer.getBoundingClientRect().left,
      width: this.sizeObj.width,
      height: this.sizeObj.height,
      image: {} as HTMLImageElement
    };

    // avoid calls before proper initialization
    if (videoInfo.width <= 0 || videoInfo.height <= 0 || videoInfo.id === '') {
      return;
    }

    // If parentCh5Background is null find thr parent ch5-background
    if (this.parentCh5Background === null) { this.parentCh5Background = this.getParentBackground(); }

    this.shellCh5Background?.videoBGRequest(videoInfo);

    // Send request only if shellTemplate background and parentBackground are not same
    if (this.shellCh5Background !== this.parentCh5Background) {
      this.parentCh5Background?.videoBGRequest(videoInfo);
    }
  }

  // Clear the previous response data, This prevents execution of blocks if the response is same
  private _clearOldResponseData() {
    this.oldResponseStatus = '';
    this.oldResponseId = 0;
  }

  // Function to add background color to bg if false and clears it if true, @param isShowVideoBehind if true, clears background
  private clearBackgroundOfVideoWrapper(isShowVideoBehind: boolean) {
    this._elContainer.style.background = isShowVideoBehind ? 'transparent' : 'black';
  }


  // Delete any elements other than control panel element
  private resetVideoElement() {
    const nodeList: NodeList = this._elContainer.childNodes;
    this.clearBackgroundOfVideoWrapper(true);
    this._elContainer.style.removeProperty('border-bottom');
    if (nodeList.length > 1) {
      this._elContainer.childNodes[1].remove();
    }
  }

  private _manageControls() {
    this.sendEvent(this.sendEventOnClick, true)
    // If ch5-video is in full screen mode then exit from the full screen
    if (this.isFullScreen) {
      this._elContainer.removeEventListener('touchmove', this.handleTouchEventOnFullScreen, false);
      this._exitFullScreen();
      return;
    }

    // Check whether the full screen option can be shown
    this.lastResponseStatus === 'started' ? this._fullScreenIcon.classList.remove('hide') : this._fullScreenIcon.classList.add('hide');

    // remove the full screen icon from the ch5-video after 10 seconds
    clearTimeout(this.controlTimer);
    this.controlTimer = setTimeout(() => {
      this._fullScreenIcon.classList.add('hide');
    }, 10000);
  }

  private toggleFullScreen(event: Event) {
    this.isFullScreen = true;
    this.orientationChanged = false;
    // To avoid swiping on the full screen
    this._elContainer.addEventListener('touchmove', this.handleTouchEventOnFullScreen, { passive: true });
    this.classList.add('full-screen');
    this._fullScreenIcon.classList.add('hide');
    document.body.classList.add('ch5-video-fullscreen');
    this.isVideoReady = true;
    this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.FULLSCREEN);
    event.stopPropagation(); // to prevent the ch5-video from triggering click event 
  }

  private _exitFullScreen() {
    this.isVideoReady = true;
    this.isFullScreen = false;
    this.classList.remove('full-screen');
    this.calculation();
    document.body.classList.remove('ch5-video-fullscreen');

    if (this.orientationChanged) {
      this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.REFILL);
      publishEvent('o', 'Csig.video.request', this.videoStopObjJSON(CH5VideoUtils.VIDEO_ACTION.STOP, this.ch5UId));
      this.videoIntersectionObserver();
    } else {
      this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.RESIZE);
      this.lastResponseStatus = "started";
    }
  }

  private handleTouchEventOnFullScreen(ev: Event) {
    ev.preventDefault();
    ev.stopImmediatePropagation();
  }

  private handleMultiVideo() {
    this.multiVideoSignalName.url = this.getAttribute('receiveStateURL')?.trim() ? this.getAttribute('receiveStateURL')?.trim() + '' : '';
    this.multiVideoSignalName.userId = this.getAttribute('receiveStateUserId')?.trim() ? this.getAttribute('receiveStateUserId')?.trim() + '' : '';
    this.multiVideoSignalName.password = this.getAttribute('receiveStatePassword')?.trim() ? this.getAttribute('receiveStatePassword')?.trim() + '' : '';
    this.multiVideoSignalName.sourceType = this.getAttribute('receiveStateSourceType')?.trim() ? this.getAttribute('receiveStateSourceType')?.trim() + '' : '';
    this.multiVideoSignalName.snapshotURL = this.getAttribute('receiveStateSnapshotURL')?.trim() ? this.getAttribute('receiveStateSnapshotURL')?.trim() + '' : '';
    this.multiVideoSignalName.snapshotUserId = this.getAttribute('receiveStateSnapshotUserId')?.trim() ? this.getAttribute('receiveStateSnapshotUserId')?.trim() + '' : '';
    this.multiVideoSignalName.snapshotPassword = this.getAttribute('receiveStateSnapshotPassword')?.trim() ? this.getAttribute('receiveStateSnapshotPassword')?.trim() + '' : '';
    this.multiVideoSignalName.snapshotRefreshRate = this.getAttribute('receiveStateSnapshotRefreshRate')?.trim() ? this.getAttribute('receiveStateSnapshotRefreshRate')?.trim() + '' : '';
  }

  private addTouchEvent() {
    this.videoTouchHandler = new Ch5VideoTouchManager({
      onTouchStartHandler: this.touchBeginHandler.bind(this),
      onTouchMoveHandler: this.touchMoveHandler.bind(this),
      onTouchEndHandler: this.touchEndHandler.bind(this),
      onTouchCancelHandler: this.touchEndHandler.bind(this),
      pollingDuration: 300,
      componentID: this.getCrId()
    } as TVideoTouchManagerParams);
  }

  // Function to remove touch listeners when polling is stopped
  private removeTouchEvent() {
    if (!!this.videoTouchHandler &&
      this.videoTouchHandler !== null &&
      typeof (this.videoTouchHandler) !== 'undefined' &&
      this.videoTouchHandler.destructor) {
      this.videoTouchHandler.destructor();
    }
  }

  // Function to handle touch start event
  private touchBeginHandler() {
    const boundedRect = this.getBoundingClientRect();
    this.touchCoordinates.startX = boundedRect.left;
    this.touchCoordinates.startY = boundedRect.top;
    this.isTouchInProgress = false;
  }

  // Function to check if the touch swipe has stopped and video finally is a static position
  private touchMoveHandler() {
    if (!this.isTouchInProgress) {
      const boundedRect = this.getBoundingClientRect();
      this.touchCoordinates.endX = boundedRect.left;
      this.touchCoordinates.endY = boundedRect.top;
      if (Math.abs(this.touchCoordinates.startX - this.touchCoordinates.endX) > this.swipeDeltaCheckNum ||
        Math.abs(this.touchCoordinates.startY - this.touchCoordinates.endY) > this.swipeDeltaCheckNum) {
        this.isTouchInProgress = true;
        // Adding stop over here
        this.clearBackgroundOfVideoWrapper(false);
        this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.STOP);
        this._publishVideoEvent(CH5VideoUtils.VIDEO_ACTION.STOP);
      }
    }
  }

  // Function to manage video play/stop based on the position on touch end or cancel
  private touchEndHandler() {
    if (this.isTouchInProgress) {
      setTimeout(() => {
        this.clearBackgroundOfVideoWrapper(true);
        this.videoIntersectionObserver();
      }, 100);
    }
    this.isTouchInProgress = false;
  }

  private validateAndAttachSnapshot() {
    if (this.snapshotURL.trim() !== '' && this.url !== '') {
      this.snapshotImage.url = this.snapshotURL;
      this.snapshotImage.userId = this.snapshotUserId;
      this.snapshotImage.password = this.snapshotPassword;
      this.snapshotImage.refreshRate = this.snapshotRefreshRate;
      this.snapshotImage.sendEventSnapshotStatus = this.sendEventSnapshotStatus;
      this.snapshotImage.sendEventSnapshotLastUpdateTime = this.sendEventSnapshotLastUpdateTime;
      if (this.lastResponseStatus !== CH5VideoUtils.VIDEO_ACTION.STARTED) {
        if (this.snapshotImage.getImage().isConnected === false) {
          this._elContainer.appendChild(this.snapshotImage.getImage());
        }
      }
    } else if (this.snapshotURL.trim() === '') {
      this.sendEvent(this.sendEventSnapshotStatus, 0)
    }
    if (this.url === '') {
      this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.NOURL);
    }
  }

  public getParentBackground(): Ch5Background {
    const getTheMatchingParent = (node: HTMLElement): Ch5Background => {
      if (node && node.classList.contains('ch5-background--parent')) {
        return node.getElementsByTagName('ch5-background')[0] as Ch5Background;
      }
      return getTheMatchingParent(node.parentElement as HTMLElement);
    }
    return getTheMatchingParent(this.parentElement as HTMLElement);
  }

  private handleOrientation = () => {
    if (this.isFullScreen === true) {
      this.orientationChanged = true;
      publishEvent('o', 'Csig.video.request', this.videoStartObjJSON(CH5VideoUtils.VIDEO_ACTION.FULLSCREEN));
    }
    else {
      this.ch5BackgroundRequest(CH5VideoUtils.VIDEO_ACTION.REFILL);
      publishEvent('o', 'Csig.video.request', this.videoStopObjJSON(CH5VideoUtils.VIDEO_ACTION.STOP, this.ch5UId));
      this.videoIntersectionObserver();
    }
  }

  private setErrorMessages() {
    this.videoErrorMessages.set(1, "Miscellaneous transient issue");
    this.videoErrorMessages.set(2, "Connection timeout");
    this.videoErrorMessages.set(3, "No input sync");
    this.videoErrorMessages.set(-1, "Miscellaneous error");
    this.videoErrorMessages.set(-2, "Hostname could not be resolved");
    this.videoErrorMessages.set(-3, "Unsupported source type for this platform");
    this.videoErrorMessages.set(-4, "Connection timeout");
    this.videoErrorMessages.set(-5, "Invalid credentials");
    this.videoErrorMessages.set(-6, "Unsupported streaming protocol");
    this.videoErrorMessages.set(-7, "Unsupported codec");
    this.videoErrorMessages.set(-1001, "Credentials required");
    this.videoErrorMessages.set(-1002, "Hostname invalid");
    this.videoErrorMessages.set(-1003, "Unsupported codec");
    this.videoErrorMessages.set(-9001, "Unsupported source type");
    this.videoErrorMessages.set(-9002, "Invalid URL");
    this.videoErrorMessages.set(-9003, "Request for greater than maximum simultaneous sessions per source type");
    this.videoErrorMessages.set(-9004, "Request for greater than maximum simultaneous sessions per device");
  }
  // #endregion

}

Ch5Video.registerCustomElement();
Ch5Video.registerSignalAttributeTypes();