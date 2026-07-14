ALTER TABLE `company_profiles` ADD `resendApiKey` varchar(512);--> statement-breakpoint
ALTER TABLE `company_profiles` ADD `googleCalendarToken` text;--> statement-breakpoint
ALTER TABLE `company_profiles` ADD `googleCalendarConnected` boolean DEFAULT false NOT NULL;