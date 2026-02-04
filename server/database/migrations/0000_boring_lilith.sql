CREATE TABLE `availability_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`start_datetime` text NOT NULL,
	`duration_hours` integer NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `booking_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`slot_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`facebook_tag` text,
	`message` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`slot_id`) REFERENCES `availability_slots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `magic_links` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`email` text NOT NULL,
	`expires_at` text NOT NULL,
	`used` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `magic_links_token_unique` ON `magic_links` (`token`);