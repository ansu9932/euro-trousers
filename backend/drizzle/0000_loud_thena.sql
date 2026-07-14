CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"action" varchar(60) NOT NULL,
	"entity" varchar(60) NOT NULL,
	"entity_id" varchar(80) NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"ip" varchar(64),
	"request_id" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(200) NOT NULL,
	"trn" varchar(30) NOT NULL,
	"address_en" text NOT NULL,
	"address_ar" text,
	"logo_key" text,
	"approval_threshold_aed" numeric(18, 2) DEFAULT '100000' NOT NULL,
	"vat_rate" numeric(6, 3) DEFAULT '5' NOT NULL,
	"hold_escalation_days" integer DEFAULT 3 NOT NULL,
	"container_alert_days" integer DEFAULT 2 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "declaration_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"declaration_id" uuid NOT NULL,
	"item_id" uuid,
	"hs_code_id" uuid,
	"description_en" text NOT NULL,
	"description_ar" text,
	"quantity" numeric(18, 3) NOT NULL,
	"uom" varchar(20) NOT NULL,
	"unit_price" numeric(18, 4) NOT NULL,
	"duty_rate" numeric(6, 3) DEFAULT '5' NOT NULL,
	"exempt" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "declarations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"number" varchar(30) NOT NULL,
	"kind" varchar(20) NOT NULL,
	"transfer_type" varchar(30),
	"version" integer DEFAULT 1 NOT NULL,
	"status" varchar(40) DEFAULT 'DRAFT' NOT NULL,
	"declaration_date" timestamp with time zone DEFAULT now() NOT NULL,
	"shipment_ref" varchar(80),
	"invoice_number" varchar(80),
	"partner_id" uuid,
	"transport_mode" varchar(20),
	"currency" varchar(3) DEFAULT 'AED' NOT NULL,
	"exchange_rate" numeric(18, 8) DEFAULT '1' NOT NULL,
	"original_value" numeric(18, 2) DEFAULT '0' NOT NULL,
	"value_aed" numeric(18, 2) DEFAULT '0' NOT NULL,
	"duty_aed" numeric(18, 2) DEFAULT '0' NOT NULL,
	"vat_aed" numeric(18, 2) DEFAULT '0' NOT NULL,
	"saif_reference" varchar(100),
	"due_back_at" timestamp with time zone,
	"parent_declaration_id" uuid,
	"remarks" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "declarations_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(40) NOT NULL,
	"entity_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"number" varchar(40),
	"version" integer DEFAULT 1 NOT NULL,
	"object_key" text NOT NULL,
	"mime_type" varchar(120) NOT NULL,
	"size" integer NOT NULL,
	"expires_at" timestamp with time zone,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(30) NOT NULL,
	"number" varchar(60) NOT NULL,
	"status" varchar(30) NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"utilized" numeric(18, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'AED' NOT NULL,
	"declaration_id" uuid,
	"issued_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "import_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"filename" text NOT NULL,
	"status" varchar(20) NOT NULL,
	"total_rows" integer DEFAULT 0 NOT NULL,
	"valid_rows" integer DEFAULT 0 NOT NULL,
	"errors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "master_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(40) NOT NULL,
	"code" varchar(60) NOT NULL,
	"name_en" varchar(240) NOT NULL,
	"name_ar" varchar(240),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notification_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" varchar(60) NOT NULL,
	"channel" varchar(20) NOT NULL,
	"recipient" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "number_sequences" (
	"type" varchar(20) NOT NULL,
	"year" integer NOT NULL,
	"value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operational_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(30) NOT NULL,
	"number" varchar(60) NOT NULL,
	"status" varchar(40) NOT NULL,
	"declaration_id" uuid,
	"owner_id" uuid,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"daily_charge" numeric(18, 2),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar(50) NOT NULL,
	"action" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"period" varchar(7) NOT NULL,
	"status" varchar(30) DEFAULT 'DRAFT' NOT NULL,
	"customs_total" numeric(18, 3) DEFAULT '0' NOT NULL,
	"warehouse_total" numeric(18, 3) DEFAULT '0' NOT NULL,
	"variance" numeric(18, 3) DEFAULT '0' NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "refresh_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(80) NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "stock_ledger" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"declaration_id" uuid,
	"direction" varchar(3) NOT NULL,
	"quantity" numeric(18, 3) NOT NULL,
	"source_type" varchar(30) NOT NULL,
	"source_id" uuid NOT NULL,
	"reversal_of" uuid,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"role_id" uuid NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workflow_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"declaration_id" uuid NOT NULL,
	"from_state" varchar(40),
	"to_state" varchar(40) NOT NULL,
	"reason" text,
	"actor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declaration_lines" ADD CONSTRAINT "declaration_lines_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declaration_lines" ADD CONSTRAINT "declaration_lines_item_id_master_records_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."master_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declaration_lines" ADD CONSTRAINT "declaration_lines_hs_code_id_master_records_id_fk" FOREIGN KEY ("hs_code_id") REFERENCES "public"."master_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_partner_id_master_records_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."master_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_records" ADD CONSTRAINT "finance_records_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_logs" ADD CONSTRAINT "import_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_records" ADD CONSTRAINT "operational_records_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "operational_records" ADD CONSTRAINT "operational_records_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliations" ADD CONSTRAINT "reconciliations_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_item_id_master_records_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."master_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_ledger" ADD CONSTRAINT "stock_ledger_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_declaration_id_declarations_id_fk" FOREIGN KEY ("declaration_id") REFERENCES "public"."declarations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_events" ADD CONSTRAINT "workflow_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "declaration_status_idx" ON "declarations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "declaration_date_idx" ON "declarations" USING btree ("declaration_date");--> statement-breakpoint
CREATE UNIQUE INDEX "master_type_code" ON "master_records" USING btree ("type","code");--> statement-breakpoint
CREATE INDEX "master_type_idx" ON "master_records" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "sequence_unique" ON "number_sequences" USING btree ("type","year");--> statement-breakpoint
CREATE INDEX "operations_type_status" ON "operational_records" USING btree ("type","status");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_unique" ON "permissions" USING btree ("module","action");--> statement-breakpoint
CREATE UNIQUE INDEX "role_permission_unique" ON "role_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stock_source_unique" ON "stock_ledger" USING btree ("source_type","source_id","item_id");