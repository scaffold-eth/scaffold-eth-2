import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { decrypt } from './decrypt';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'decrypt':
      if (request.params == undefined || request.params.encryptedString == undefined) {
        throw new Error('Request should include params.encryptedString.');
      }
      return await decrypt(request.params.encryptedString);
    default:
      throw new Error('Method not found.');
  }
};
