const { CalculateFutureWarningMessageService } = require("./calculate-warning-messages-future-years");
const { CreateOrUpdateWarningMessage } = require("./create-update-warning-messages.service");

class ProcessFutureManuresForWarnings {
    constructor (){

        this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
        this.CalculateFutureWarningMessageService =new CalculateFutureWarningMessageService();  
    }
  async ProcessFutureManuresFor(
    fieldId,
    applicationDate,
    isCurrentOrganicManure,
    isCurrentFertiliser,
    excludeId,
    transactionalManager,
    userId
  ) {
    console.log("combining manures")
    // 1. Call stored procedure – already sorted + flags added by SP
    const combinedManures = await transactionalManager.query(
      `EXEC spWarning_GetAllManuresByField  @FieldID = @0,
      @ApplicationDate = @1,
      @IsCurrentOrganicManure = @2,
      @IsCurrentFertiliser = @3,
      @ExcludeID = @4`,
      [
        fieldId,
        applicationDate,
        isCurrentOrganicManure ? 1 : 0,
        isCurrentFertiliser ? 1 : 0,
        excludeId,
      ]
    );

  

    
        console.log("calculating warning");
   if (combinedManures?.length > 0){
     // 2. Loop through each manure item
     for (const manure of combinedManures) {
       let warnings = [];
       const finalWarnings = [];

       // 3. Fertiliser warnings
       if (manure.isFertiliserManure === true && manure.N > 0) {
         warnings =
           await this.CalculateFutureWarningMessageService.calculateFertiliserWarningMessage(
             transactionalManager,
             manure
           );
       }

       // 4. Organic manure warnings
       if (manure.isOrganicManure === true) {
         warnings =
           await this.CalculateFutureWarningMessageService.calculateOrganicManureWarningMessage(
             transactionalManager,
             manure
           );
       }

       // 5. Push results safely (in case function returns array or null)
       if (Array.isArray(warnings) && warnings.length > 0) {
         finalWarnings.push(...warnings);
       }

       // 6. Sync warnings one-by-one for this manure

       await this.CreateOrUpdateWarningMessage.syncWarningMessages(
         manure.ManagementPeriodID,
         manure,
         finalWarnings,
         transactionalManager,
         userId
       );
     }

   }
  }
}

module.exports = {
  ProcessFutureManuresForWarnings,
};
