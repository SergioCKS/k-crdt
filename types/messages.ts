/**
 * # Message types
 *
 * Unified message interface for event handling throughout the system.
 *
 * The following connections are modeled:
 *
 * * App <-> Worker (Via DOM events)
 * * Client <-> Server (Via WebSockets)
 *
 * These types are a dependency for both the client node code as well as the server node code,
 * as such, they are copied to the corresponding places on the build process.
 *
 * Messages of each actor (App, Worker, Client, Server) are added to a message object for which the
 * keys correspond to message codes and values are the types of the payload. From these message objects,
 * message types are built automatically and exported.
 * @module
 */

//#region Message objects
/**
 * ## App message object
 *
 * Object specifying the codes and payload types of app messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type AppMessageObj = {
  initialize: undefined;
  "update-time-offset": { value: number };
  "no-sync-connection": undefined;
  "restore-registers": undefined;
  "create-bool-register": { value: boolean };
  test: undefined;
};

/**
 * ## Worker message object
 *
 * Object specifying the codes and payload types of worker messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type WorkerMessageObj = {
  initialized: undefined;
  "offline-value": { value: boolean };
  "new-register": { id: string; value: boolean; type: "bool" };
  "restored-registers": { value: Record<string, unknown> };
};

/**
 * ## Client message object
 *
 * Object specifying the codes and payload types of client messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type ClientMessageObj = {
  "time-sync": { t0: number };
  test: undefined;
};

/**
 * ## Server message object
 *
 * Object specifying the codes and payload types of server messages.
 * If the message is not meant to include a payload, the type is left as undefined.
 */
type ServerMessageObj = {
  "time-sync": TimeSyncPayload;
  test: any;
};
//#endregion

/**
 * ## Message types from message object
 *
 * Given a message object this type builds an object type having all keys of the message object
 * with the corresponding message type as value.
 */
type MessageTypes<MessageObj> = {
  [key in keyof MessageObj]: MessageObj[key] extends undefined
    ? {
        msgCode: key;
        payload?: undefined;
      }
    : {
        msgCode: key;
        payload: MessageObj[key];
      };
};

//#region Exported message types
/**
 * ## App message (type)
 *
 * Type of a valid app message.
 */
export type AppMessage = MessageTypes<AppMessageObj>[keyof AppMessageObj];

/**
 * ## Worker message (type)
 *
 * Type of a valid worker message.
 */
export type WorkerMessage =
  MessageTypes<WorkerMessageObj>[keyof WorkerMessageObj];

/**
 * ## Client message (type)
 *
 * Type of a valid client message.
 */
export type ClientMessage =
  MessageTypes<ClientMessageObj>[keyof ClientMessageObj];

/**
 * ## Server message (type)
 *
 * Type of a valid server message.
 */
export type ServerMessage =
  MessageTypes<ServerMessageObj>[keyof ServerMessageObj];
//#endregion

/**
 * ## Time sync for `TimeSync` server message
 */
interface TimeSyncPayload {
  /**
   * ### Request transmission timestamp
   *
   * Client-side timestamp that is as close as possible to packet transmission of the request message in milliseconds since UNIX epoch.
   */
  t0: number;

  /**
   * ### Request reception timestamp
   *
   * Server-side timestamp that is as close as possible to packet reception of the request message in milliseconds since UNIX epoch.
   */
  t1: number;

  /**
   * ### Response transmission timestamp
   *
   * Server-side timestamp that is as close as possible to packet transmission of the response message in milliseconds since UNIX epoch.
   */
  t2?: number;
}
