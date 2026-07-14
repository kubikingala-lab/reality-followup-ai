ALTER TABLE `company_profiles` ADD `licenseKey` varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE `company_profiles` ADD `licensedCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `company_profiles` ADD `licensedCustomerName` varchar(255);--> statement-breakpoint
ALTER TABLE `company_profiles` ADD `licensedCustomerEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `company_profiles` ADD `licenseExpiresAt` timestamp;