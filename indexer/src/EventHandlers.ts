import { ERC20, Account } from "generated";
import { OFFSET, ZERO_ADDRESS } from "./constants";
import { startOfHourFromTimestamp } from "./utils";
import { start } from "repl";

ERC20.Transfer.handler(async ({ event, context }) => {
  // Track balances for sender and receiver
  const fromAddress = event.params.from;
  const toAddress = event.params.to;
  const value = event.params.value;

  /*//////////////////////////////////////////////////////////////
                            BALANCE TRACKING
  //////////////////////////////////////////////////////////////*/

  // Update sender's balance
  let fromAccount = await context.Account.getOrCreate({
    id: `${fromAddress}-${event.srcAddress}`,
    balance: BigInt(0),
  });
  context.Account.set({
    ...fromAccount,
    balance: fromAccount.balance - value,
  });

  // Update receiver's balance
  let toAccount = await context.Account.getOrCreate({
    id: `${toAddress}-${event.srcAddress}`,
    balance: BigInt(0),
  });
  context.Account.set({
    ...toAccount,
    balance: toAccount.balance + value,
  });

  /*//////////////////////////////////////////////////////////////
                          TRACK MINTS & BURNS
  //////////////////////////////////////////////////////////////*/
  const startOfHour = startOfHourFromTimestamp(event.block.timestamp);
  const globalState = await context.GloablState.getOrCreate({
    id: "singleton",
    curentIndex: BigInt(0),
    currentHourStart: BigInt(startOfHour),
  });

  if (fromAddress == ZERO_ADDRESS) {
    const mintEntity = await context.Mints.getOrCreate({
      id: `${startOfHour}-${event.srcAddress}`,
      hourStart: BigInt(startOfHour),
      value: BigInt(0),
      deleteIndex: globalState.curentIndex,
      token: event.srcAddress,
    });

    context.Mints.set({
      ...mintEntity,
      value: mintEntity.value + value,
    });
  }

  if (toAddress == ZERO_ADDRESS) {
    const burnEntity = await context.Burns.getOrCreate({
      id: `${startOfHour}-${event.srcAddress}`,
      hourStart: BigInt(startOfHour),
      value: BigInt(0),
      deleteIndex: globalState.curentIndex,
      token: event.srcAddress,
    });

    context.Burns.set({
      ...burnEntity,
      value: burnEntity.value + value,
    });
  }

  if (globalState.curentIndex > BigInt(OFFSET)) {
    const deleteIndex = globalState.curentIndex - BigInt(OFFSET);

    // delete old mints
    const oldMintEntities =
      await context.Mints.getWhere.deleteIndex.lt(deleteIndex);
    for (const oldMint of oldMintEntities) {
      context.Mints.deleteUnsafe(oldMint.id);
    }

    // delete old burns
    const oldBurnEntities =
      await context.Burns.getWhere.deleteIndex.lt(deleteIndex);
    for (const oldBurn of oldBurnEntities) {
      context.Burns.deleteUnsafe(oldBurn.id);
    }
  }

  if (startOfHour > Number(globalState.currentHourStart)) {
    context.GloablState.set({
      ...globalState,
      curentIndex: globalState.curentIndex + BigInt(1),
      currentHourStart: BigInt(startOfHour),
    });
  }
});
