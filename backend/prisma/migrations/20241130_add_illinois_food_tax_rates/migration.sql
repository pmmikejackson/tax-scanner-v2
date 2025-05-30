-- Migration: Add Illinois food tax rate support
-- This adds foodTaxRate columns to support Illinois dual-rate system (general vs food/medicine)

-- Add foodTaxRate column to states table
ALTER TABLE "states" ADD COLUMN "foodTaxRate" DOUBLE PRECISION;

-- Add foodTaxRate column to counties table
ALTER TABLE "counties" ADD COLUMN "foodTaxRate" DOUBLE PRECISION;

-- Add foodTaxRate column to cities table
ALTER TABLE "cities" ADD COLUMN "foodTaxRate" DOUBLE PRECISION;

-- Update existing Texas records to have same foodTaxRate as taxRate (no food differentiation)
UPDATE "states" 
SET "foodTaxRate" = "taxRate" 
WHERE "code" = 'TX';

UPDATE "counties" 
SET "foodTaxRate" = "taxRate" 
WHERE "stateId" IN (SELECT id FROM "states" WHERE "code" = 'TX');

UPDATE "cities" 
SET "foodTaxRate" = "taxRate" 
WHERE "countyId" IN (
  SELECT c.id FROM "counties" c 
  JOIN "states" s ON c."stateId" = s.id 
  WHERE s."code" = 'TX'
); 