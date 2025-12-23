CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`userId` int,
	`action` varchar(255) NOT NULL,
	`resourceType` varchar(100),
	`resourceId` int,
	`changes` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`authorId` int,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featuredImageUrl` varchar(1000),
	`category` enum('med_spa_growth','dental_implant_growth','multi_location_presence','conversion_playbooks','experiments'),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`seoTitle` varchar(500),
	`seoMetaDescription` text,
	`canonicalUrl` varchar(1000),
	`schemaJson` text,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`vertical` enum('med_spa','dental_implants','multi_location','general') NOT NULL,
	`contentType` enum('blog_post','landing_page','seo_improvement','email') NOT NULL,
	`promptTemplate` text NOT NULL,
	`systemPrompt` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contentTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliverableRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`requestedBy` int NOT NULL,
	`type` enum('landing_page','blog_post','seo_improvement','internal_linking','local_presence','weekly_report') NOT NULL,
	`status` enum('requested','needs_info','queued','running','done','failed') NOT NULL DEFAULT 'requested',
	`priority` int NOT NULL DEFAULT 100,
	`requestData` text,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `deliverableRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`tenantId` int NOT NULL,
	`type` enum('landing_page','blog_post','seo_improvement','internal_linking','local_presence','weekly_report') NOT NULL,
	`title` varchar(500),
	`contentUrl` varchar(1000),
	`metadataJson` text,
	`version` int NOT NULL DEFAULT 1,
	`publishedToWordpress` boolean DEFAULT false,
	`wordpressPostId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `landingPages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`slug` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`pageType` varchar(100),
	`targetKeywords` text,
	`seoTitle` varchar(500),
	`seoMetaDescription` text,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`publishedToWordpress` boolean DEFAULT false,
	`wordpressPageId` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `landingPages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`eventType` varchar(100) NOT NULL,
	`consentGiven` boolean DEFAULT false,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`name` varchar(255),
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`source` varchar(255),
	`sourcePage` varchar(1000),
	`vertical` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`monthlyPrice` int NOT NULL,
	`maxLocations` int NOT NULL,
	`maxSiteConnections` int NOT NULL,
	`maxTeamSeats` int NOT NULL,
	`monthlyLandingPages` int NOT NULL,
	`monthlyBlogPosts` int NOT NULL,
	`monthlySeoImprovements` int NOT NULL,
	`monthlyInternalLinking` int NOT NULL,
	`monthlyLocalPresence` int NOT NULL,
	`weeklyReports` boolean DEFAULT true,
	`priorityQueue` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_name_unique` UNIQUE(`name`),
	CONSTRAINT `plans_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `quotaUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`landingPagesUsed` int NOT NULL DEFAULT 0,
	`blogPostsUsed` int NOT NULL DEFAULT 0,
	`seoImprovementsUsed` int NOT NULL DEFAULT 0,
	`internalLinkingUsed` int NOT NULL DEFAULT 0,
	`localPresenceUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quotaUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`revenuecatCustomerId` varchar(255),
	`revenuecatSubscriptionId` varchar(255),
	`plan` enum('starter','pro','scale') NOT NULL,
	`status` enum('active','past_due','canceled','expired','trialing') NOT NULL DEFAULT 'trialing',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`vertical` enum('med_spa','dental_implants','multi_location'),
	`status` enum('active','paused','canceled') NOT NULL DEFAULT 'active',
	`apiKey` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	CONSTRAINT `tenants_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `tenants_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `websiteConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`platform` enum('wordpress','hosted') NOT NULL,
	`siteUrl` varchar(500),
	`encryptedCredentials` text,
	`autoPublish` boolean DEFAULT false,
	`lastTestAt` timestamp,
	`lastTestStatus` enum('success','failed'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `websiteConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflowRuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int,
	`workflowName` varchar(255) NOT NULL,
	`n8nExecutionId` varchar(255),
	`status` enum('running','success','failed') NOT NULL,
	`inputData` text,
	`outputData` text,
	`errorMessage` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `workflowRuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','staff','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `tenantId` int;--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `auditLog` (`tenantId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `auditLog` (`action`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `blogPosts` (`slug`);--> statement-breakpoint
CREATE INDEX `tenant_status_idx` ON `blogPosts` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `blogPosts` (`category`);--> statement-breakpoint
CREATE INDEX `vertical_type_idx` ON `contentTemplates` (`vertical`,`contentType`);--> statement-breakpoint
CREATE INDEX `tenant_status_idx` ON `deliverableRequests` (`tenantId`,`status`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `deliverableRequests` (`priority`);--> statement-breakpoint
CREATE INDEX `request_idx` ON `deliverables` (`requestId`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `deliverables` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_slug_idx` ON `landingPages` (`tenantId`,`slug`);--> statement-breakpoint
CREATE INDEX `lead_idx` ON `leadEvents` (`leadId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `leads` (`email`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `leads` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_period_idx` ON `quotaUsage` (`tenantId`,`periodStart`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `subscriptions` (`tenantId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `websiteConnections` (`tenantId`);--> statement-breakpoint
CREATE INDEX `tenant_workflow_idx` ON `workflowRuns` (`tenantId`,`workflowName`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `workflowRuns` (`status`);--> statement-breakpoint
CREATE INDEX `tenant_idx` ON `users` (`tenantId`);