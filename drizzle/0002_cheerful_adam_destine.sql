CREATE TABLE `wordpressRollbackHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`batchId` varchar(64) NOT NULL,
	`wordpressPostId` int NOT NULL,
	`postType` enum('post','page') NOT NULL,
	`previousTitle` text,
	`previousContent` text,
	`previousExcerpt` text,
	`previousStatus` varchar(50),
	`previousMeta` text,
	`newTitle` text,
	`newContent` text,
	`updatedBy` int,
	`reverted` boolean DEFAULT false,
	`revertedAt` timestamp,
	`revertedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wordpressRollbackHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `tenant_batch_idx` ON `wordpressRollbackHistory` (`tenantId`,`batchId`);--> statement-breakpoint
CREATE INDEX `post_idx` ON `wordpressRollbackHistory` (`wordpressPostId`);