const { In } = require("typeorm");
const {
  WarningMessagesEntity,
} = require("../db/entity/warning-message.entity");

class CreateOrUpdateWarningMessage {
  constructor() {}

  async syncWarningMessages(
    warningMessagesArray,
    transactionalManager,
    userId
  ) {
    if (
      !Array.isArray(warningMessagesArray) ||
      warningMessagesArray.length === 0
    )
      return;

    const fieldID = warningMessagesArray[0].FieldID;
    const cropID = warningMessagesArray[0].CropID;
    const joiningID = warningMessagesArray[0].JoiningID ?? null;

    // Fetch existing DB entries
    const existingMessages = await transactionalManager.find(
      WarningMessagesEntity,
      {
        where: { FieldID: fieldID, CropID: cropID, JoiningID: joiningID },
      }
    );

    // Helper for equality check (ignores IDs/timestamps)
    const areMessagesEqual = (a, b) => {
      const keysToCompare = [
        "Header",
        "Para1",
        "Para2",
        "Para3",
        "WarningCodeID",
        "WarningLevelID",
        "PreviousID",
      ];
      return keysToCompare.every((key) => a[key] === b[key]);
    };

    const processedIDs = new Set();

    // 2️⃣ Update existing or insert new
    for (const newMsg of warningMessagesArray) {
      const match = existingMessages.find((dbMsg) =>
        areMessagesEqual(dbMsg, newMsg)
      );

      if (match) {
        //Update only if something has changed
        const hasChanged = Object.keys(newMsg).some(
          (key) => newMsg[key] !== match[key]
        );
        if (hasChanged) {
          const { ID, CreatedOn, CreatedByID, ...updateData } = newMsg;
          await transactionalManager.update(
            WarningMessagesEntity,
            { ID: match.ID },
            {
              ...updateData,
              ModifiedOn: new Date(),
              ModifiedByID: userId,
            }
          );
        }
        processedIDs.add(match.ID);
      } else {
        // ✅ Insert new
        const { ID, ...insertData } = newMsg;
        const inserted = await transactionalManager.insert(
          WarningMessagesEntity,
          {
            ...insertData,
            CreatedOn: new Date(),
            CreatedByID: userId,
          }
        );
        if (inserted.identifiers && inserted.identifiers[0]?.ID)
          processedIDs.add(inserted.identifiers[0].ID);
      }
    }

    // 3️⃣ Delete any that weren’t processed
    const toDelete = existingMessages.filter(
      (msg) => !processedIDs.has(msg.ID)
    );
    if (toDelete.length > 0) {
      const idsToDelete = toDelete.map((m) => m.ID);
      await transactionalManager.delete(WarningMessagesEntity, {
        ID: In(idsToDelete),
      });
    }

    console.log(
      `✅ WarningMessages synced successfully for FieldID=${fieldID}, CropID=${cropID}, JoiningID=${joiningID}`
    );
  }
}

module.exports = {
  CreateOrUpdateWarningMessage,
};
