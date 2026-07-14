CREATE TABLE `communications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`leadId` int NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL,
	`kind` enum('initial_reply','follow_up','manual','note') NOT NULL,
	`subject` varchar(240),
	`body` text NOT NULL,
	`deliveryStatus` enum('draft','sent','failed','received') NOT NULL,
	`followUpDay` int,
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`companyName` varchar(160) NOT NULL DEFAULT 'Domov Reality',
	`logoUrl` text,
	`logoKey` varchar(512),
	`primaryColor` varchar(16) NOT NULL DEFAULT '#C66A3D',
	`senderName` varchar(160) NOT NULL DEFAULT 'Realitní tým',
	`senderEmail` varchar(320),
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `company_profiles_owner_idx` UNIQUE(`ownerId`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(64) NOT NULL,
	`location` varchar(180) NOT NULL,
	`propertyType` varchar(140) NOT NULL,
	`budget` varchar(140) NOT NULL,
	`lookingFor` text NOT NULL,
	`notes` text,
	`status` enum('new','answered','qualified','meeting_scheduled','lost') NOT NULL DEFAULT 'new',
	`isDemo` boolean NOT NULL DEFAULT false,
	`clientRepliedAt` timestamp,
	`lastOutboundAt` timestamp,
	`followUp1SentAt` timestamp,
	`followUp3SentAt` timestamp,
	`followUp7SentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `communications` ADD CONSTRAINT `communications_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `communications` ADD CONSTRAINT `communications_leadId_leads_id_fk` FOREIGN KEY (`leadId`) REFERENCES `leads`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `company_profiles` ADD CONSTRAINT `company_profiles_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leads` ADD CONSTRAINT `leads_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `communications_lead_idx` ON `communications` (`leadId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `communications_owner_idx` ON `communications` (`ownerId`);--> statement-breakpoint
CREATE INDEX `company_profiles_cron_idx` ON `company_profiles` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `leads_owner_idx` ON `leads` (`ownerId`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_followup_idx` ON `leads` (`clientRepliedAt`,`lastOutboundAt`);