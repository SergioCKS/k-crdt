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
export {};
