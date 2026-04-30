const storedProcedure = {
  DELETE_CROP: "EXEC dbo.spCrops_DeleteCrops @CropsID = @0",
};

module.exports = { storedProcedure };
