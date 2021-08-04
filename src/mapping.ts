import {
  Address,
  ethereum,
  log,
  ByteArray,
  BigInt,
  Bytes,
} from "@graphprotocol/graph-ts";
import { Contract, Attested, Revoked } from "../generated/Contract/Contract";
import { Message, User } from "../generated/schema";

export function handleAttested(event: Attested): void {
  let usernameUUID =
    "0x1a1aac09dcf87a6662ca6f7cfda6cf8ab0d7e2b6fc4afcde3112480a36c563b1";
  let messageUUID =
    "0xa082b0a64557fd912265053a2bf90213dc3813f26ba3d116122b3ee30d5f6f9d";

  if (event.params.schema.toHexString() == messageUUID) {
    let entity = new Message(event.params.uuid.toHex());

    entity.recipient = event.params.recipient.toHexString();
    entity.attester = event.params.attester.toHexString();

    let contract = Contract.bind(event.address);

    let att = contract.getAttestation(event.params.uuid);
    entity.data = att.data;
    entity.time = att.time;
    entity.user = att.attester.toHex();
    entity.revoked = false;
    entity.save();
  }
  if (event.params.schema.toHexString() == usernameUUID) {
    let contract = Contract.bind(event.address);
    let att = contract.getAttestation(event.params.uuid);

    let user = User.load(att.attester.toHex());

    if (user === null) {
      user = new User(att.attester.toHex());
    }

    user.usernameData = att.data;
    user.updated = att.time;
    user.save();
  }
}

export function handleRevoked(event: Revoked): void {
  let entity = Message.load(event.params.uuid.toHex());
  if (entity) {
    entity.revoked = true;
    entity.save();
  }
}
