const { In } = require("typeorm");
const {
  WarningMessagesEntity,
} = require("../db/entity/warning-message.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { CropEntity } = require("../db/entity/crop.entity");

class CreateOrUpdateWarningMessage {
  async getCropAndField(manager, managementPeriodID) {
    const mp = await manager.findOne(ManagementPeriodEntity, {
      where: { ID: managementPeriodID },
    });
    if (!mp)
      throw new Error(`ManagementPeriod ${managementPeriodID} not found`);

    const crop = await manager.findOne(CropEntity, {
      where: { ID: mp.CropID },
    });
    if (!crop) throw new Error(`Crop ${mp.CropID} not found`);

    return { cropID: crop.ID, fieldID: crop.FieldID };
  }

  async syncWarningMessages(
    managementPeriodID,
    manure,
    warningMessagesArray,
    transactionalManager,
    userId
  ) {
  
  
      const { cropID, fieldID } = await this.getCropAndField(
        transactionalManager,
        managementPeriodID
      );

   
    // -------------------------------
    // 3️⃣ Fetch existing messages
    //     Case 1: JoiningID = manureID
    //     Case 2: JoiningID = fieldID
    // -------------------------------
    const existingByManure = await transactionalManager.find(
      WarningMessagesEntity,
      {
        where: {
          FieldID: fieldID,
          CropID: cropID,
          JoiningID: manure.ID,
        },
      }
    );

    const existingByField = await transactionalManager.find(
      WarningMessagesEntity,
      {
        where: {
          FieldID: fieldID,
          CropID: cropID,
          JoiningID: fieldID,
        },
      }
    );

    // -------------------------------
    // 4️⃣ Merge & de-duplicate
    // -------------------------------
    const existingMessagesMap = new Map();

    [...existingByManure, ...existingByField].forEach((msg) => {
      existingMessagesMap.set(msg.ID, msg);
    });

    const existingMessages = Array.from(existingMessagesMap?.values());
    const incomeingWarning = warningMessagesArray[0] ?? [];

    // Treat null or empty array the same way
    if (
      warningMessagesArray === null ||
      (Array.isArray(warningMessagesArray) && incomeingWarning?.length === 0)
    ) {
      // Case 1: No incoming warnings AND no existing messages → just return
      if (!existingMessages || existingMessages?.length === 0) {
        return;
      }

      // Case 2: No incoming warnings BUT existing messages present → delete them
      await transactionalManager.delete(WarningMessagesEntity, {
        ID: In(existingMessages.map((m) => m.ID)),
      });

      console.log(
        `🗑️ WarningMessages deleted for FieldID=${fieldID}, CropID=${cropID}`
      );

      return;
    }

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
      `✅ WarningMessages synced successfully for FieldID=${fieldID}, CropID=${cropID}`
    );
  }
}

module.exports = {
  CreateOrUpdateWarningMessage,
};
