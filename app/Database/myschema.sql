-- ====================================================================
-- HOSTEL PLATFORM — FULL SCHEMA (pure SQL, Neon/Postgres)
-- Converted from Prisma schema + supplemental.sql. Paste directly.
-- Run as one script (order matters — extensions/enums/tables first,
-- then indexes/constraints, then trigger functions/triggers).
-- ====================================================================

-- ==================== EXTENSIONS ====================
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS postgis;    -- geography(Point, 4326)
CREATE EXTENSION IF NOT EXISTS btree_gist; -- EXCLUDE USING gist on space_id

-- ==================== ENUMS ====================

CREATE TYPE user_role AS ENUM ('STUDENT', 'OWNER', 'ADMIN');

CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED');

CREATE TYPE verification_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

CREATE TYPE hostel_status AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'SUSPENDED', 'REJECTED');

CREATE TYPE room_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

CREATE TYPE space_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'INACTIVE');

CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED');

CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');

CREATE TYPE report_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- ==================== USERS ====================

CREATE TABLE users (
                       id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       auth_id        VARCHAR(255) UNIQUE,
                       first_name     VARCHAR(100) NOT NULL,
                       last_name      VARCHAR(100) NOT NULL,
                       email          VARCHAR(255) NOT NULL UNIQUE,
                       phone          VARCHAR(30) UNIQUE,
                       role           user_role NOT NULL,
                       status         user_status NOT NULL DEFAULT 'PENDING',
                       email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                       phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
                       created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== UNIVERSITIES ====================

CREATE TABLE universities (
                              id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              name       VARCHAR(255) NOT NULL,
                              city       VARCHAR(100),
                              location   GEOGRAPHY(POINT, 4326),
                              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== STUDENT PROFILES ====================

CREATE TABLE student_profiles (
                                  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                  student_number VARCHAR(100),
                                  university_id  UUID REFERENCES universities(id) ON DELETE SET NULL,
                                  program        VARCHAR(255),
                                  year_of_study  INTEGER,
                                  gender         VARCHAR(30),
                                  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== OWNER PROFILES ====================
-- No ID/document fields — deliberately excluded for sensitivity reasons.

CREATE TABLE owner_profiles (
                                user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== OWNER VERIFICATIONS ====================
-- Status/workflow record only — no uploaded documents stored.

CREATE TABLE owner_verifications (
                                     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                     status       verification_status NOT NULL DEFAULT 'PENDING',
                                     submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                                     reviewed_at  TIMESTAMPTZ,
                                     reviewed_by  UUID REFERENCES users(id) ON DELETE SET NULL,
                                     review_notes TEXT
);

-- ==================== HOSTELS ====================

CREATE TABLE hostels (
                         id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                         name              VARCHAR(255) NOT NULL,
                         description       TEXT,
                         address           TEXT,
                         area              VARCHAR(150),
                         city              VARCHAR(100),
                         contact_phone     VARCHAR(30),
                         deposit_amount    DECIMAL(12, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
                         other_fees        TEXT,
                         location          GEOGRAPHY(POINT, 4326),
                         gender_preference VARCHAR(30),
                         status            hostel_status NOT NULL DEFAULT 'DRAFT',
                         created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
                         updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== ROOMS ====================

CREATE TABLE rooms (
                       id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       hostel_id       UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
                       room_number     VARCHAR(50),
                       description     TEXT,
                       price_per_month DECIMAL(12, 2) NOT NULL,
                       status          room_status NOT NULL DEFAULT 'ACTIVE',
                       created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                       updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== ROOM IMAGES ====================

CREATE TABLE room_images (
                             id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
                             image_url     TEXT NOT NULL,
                             caption       VARCHAR(255),
                             is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
                             display_order INTEGER NOT NULL DEFAULT 0,
                             created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== ROOM SPACES ====================

CREATE TABLE room_spaces (
                             id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                             room_id      UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
                             space_number VARCHAR(50),
                             status       space_status NOT NULL DEFAULT 'ACTIVE',
                             created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                             updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== AMENITIES ====================

CREATE TABLE amenities (
                           id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           name        VARCHAR(100) NOT NULL UNIQUE,
                           description TEXT
);

-- ==================== HOSTEL AMENITIES ====================

CREATE TABLE hostel_amenities (
                                  hostel_id  UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
                                  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
                                  PRIMARY KEY (hostel_id, amenity_id)
);

-- ==================== HOSTEL IMAGES ====================

CREATE TABLE hostel_images (
                               id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               hostel_id     UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
                               image_url     TEXT NOT NULL,
                               caption       VARCHAR(255),
                               is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
                               display_order INTEGER NOT NULL DEFAULT 0,
                               created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== BOOKINGS ====================

CREATE TABLE bookings (
                          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          student_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                          space_id        UUID NOT NULL REFERENCES room_spaces(id) ON DELETE RESTRICT,
                          start_date      DATE NOT NULL,
                          end_date        DATE,
                          monthly_price   DECIMAL(12, 2) NOT NULL,
                          status          booking_status NOT NULL DEFAULT 'PENDING',
                          student_message TEXT,
                          created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
                          updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== PAYMENTS ====================

CREATE TABLE payments (
                          id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          booking_id             UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
                          amount                 DECIMAL(12, 2) NOT NULL,
                          currency               VARCHAR(10) NOT NULL DEFAULT 'MWK',
                          payment_status         payment_status NOT NULL DEFAULT 'PENDING',
                          payment_method         VARCHAR(50),
                          transaction_reference  VARCHAR(255) UNIQUE,
                          receipt_number         VARCHAR(100) UNIQUE,
                          paid_at                TIMESTAMPTZ,
                          created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== CONVERSATIONS ====================

CREATE TABLE conversations (
                               id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               student_id  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                               owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                               hostel_id   UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
                               is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
                               unlocked_at TIMESTAMPTZ,
                               created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                               UNIQUE (student_id, owner_id, hostel_id),
    -- composite unique so messaging_payments can FK to (id, student_id)
                               UNIQUE (id, student_id)
);

-- ==================== MESSAGES ====================

CREATE TABLE messages (
                          id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                          sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                          message         TEXT NOT NULL,
                          is_read         BOOLEAN NOT NULL DEFAULT FALSE,
                          created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== MESSAGING PAYMENTS ====================

CREATE TABLE messaging_payments (
                                    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    student_id            UUID NOT NULL,
                                    conversation_id       UUID NOT NULL,
                                    amount                DECIMAL(12, 2) NOT NULL DEFAULT 500.00,
                                    currency              VARCHAR(10) NOT NULL DEFAULT 'MWK',
                                    payment_status        payment_status NOT NULL DEFAULT 'PENDING',
                                    transaction_reference VARCHAR(255) UNIQUE,
                                    expires_at            TIMESTAMPTZ,
                                    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- composite FK guarantees the paying student actually belongs to
    -- the conversation being unlocked
                                    FOREIGN KEY (conversation_id, student_id)
                                        REFERENCES conversations(id, student_id) ON DELETE CASCADE
);

-- ==================== REVIEWS ====================

CREATE TABLE reviews (
                         id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
                         hostel_id  UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
                         rating     INTEGER NOT NULL,
                         comment    TEXT,
                         created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== REPORTS ====================

CREATE TABLE reports (
                         id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         reporter_id      UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                         hostel_id        UUID REFERENCES hostels(id) ON DELETE CASCADE,
                         reported_user_id UUID REFERENCES users(id) ON DELETE RESTRICT,
                         reason           VARCHAR(255) NOT NULL,
                         description      TEXT NOT NULL,
                         status           report_status NOT NULL DEFAULT 'OPEN',
                         admin_notes      TEXT,
                         resolved_by      UUID REFERENCES users(id) ON DELETE SET NULL,
                         resolved_at      TIMESTAMPTZ,
                         created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== NOTIFICATIONS ====================

CREATE TABLE notifications (
                               id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                               title             VARCHAR(255) NOT NULL,
                               message           TEXT NOT NULL,
                               notification_type VARCHAR(50),
                               reference_id      UUID,
                               is_read           BOOLEAN NOT NULL DEFAULT FALSE,
                               created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==================== SYSTEM SETTINGS ====================

CREATE TABLE system_settings (
                                 key         VARCHAR(100) PRIMARY KEY,
                                 value       TEXT NOT NULL,
                                 description TEXT,
                                 updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
                                 updated_by  UUID REFERENCES users(id) ON DELETE SET NULL
);

-- ==================== BOOKING STATUS HISTORY ====================

CREATE TABLE booking_status_history (
                                        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
                                        old_status booking_status,
                                        new_status booking_status NOT NULL,
                                        changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
                                        reason     TEXT,
                                        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- INDEXES
-- ====================================================================

CREATE INDEX idx_owner_verifications_owner ON owner_verifications(owner_id);
CREATE INDEX idx_owner_verifications_status ON owner_verifications(status);

CREATE INDEX idx_hostels_owner ON hostels(owner_id);
CREATE INDEX idx_hostels_status ON hostels(status);
CREATE INDEX idx_hostels_location ON hostels USING GIST(location);

CREATE INDEX idx_rooms_hostel ON rooms(hostel_id);
CREATE INDEX idx_rooms_status ON rooms(status);

CREATE INDEX idx_room_images_room ON room_images(room_id);

CREATE INDEX idx_room_spaces_room ON room_spaces(room_id);
CREATE INDEX idx_room_spaces_status ON room_spaces(status);

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_space ON bookings(space_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_reviews_hostel ON reviews(hostel_id);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reporter ON reports(reporter_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

CREATE INDEX idx_booking_status_history_booking ON booking_status_history(booking_id);
CREATE INDEX idx_booking_status_history_created ON booking_status_history(created_at);

CREATE INDEX idx_universities_location ON universities USING GIST(location);

-- Partial unique indexes
CREATE UNIQUE INDEX idx_unique_room_number_per_hostel
    ON rooms(hostel_id, room_number) WHERE room_number IS NOT NULL;

CREATE UNIQUE INDEX idx_unique_space_number_per_room
    ON room_spaces(room_id, space_number) WHERE space_number IS NOT NULL;

CREATE UNIQUE INDEX idx_one_primary_hostel_image
    ON hostel_images(hostel_id) WHERE is_primary = TRUE;

CREATE UNIQUE INDEX idx_one_primary_room_image
    ON room_images(room_id) WHERE is_primary = TRUE;

-- ====================================================================
-- CHECK CONSTRAINTS
-- ====================================================================

ALTER TABLE student_profiles
    ADD CONSTRAINT positive_year_of_study
        CHECK (year_of_study IS NULL OR year_of_study >= 0);

ALTER TABLE owner_verifications
    ADD CONSTRAINT valid_review_dates
        CHECK (reviewed_at IS NULL OR reviewed_at >= submitted_at);

ALTER TABLE rooms
    ADD CONSTRAINT positive_room_price
        CHECK (price_per_month >= 0);

ALTER TABLE hostel_images
    ADD CONSTRAINT non_negative_display_order
        CHECK (display_order >= 0);

ALTER TABLE room_images
    ADD CONSTRAINT non_negative_room_image_display_order
        CHECK (display_order >= 0);

ALTER TABLE bookings
    ADD CONSTRAINT valid_booking_dates
        CHECK (end_date IS NULL OR end_date > start_date),
    ADD CONSTRAINT positive_booking_price
    CHECK (monthly_price >= 0);

ALTER TABLE payments
    ADD CONSTRAINT positive_payment_amount
        CHECK (amount > 0);

ALTER TABLE messages
    ADD CONSTRAINT non_empty_message
        CHECK (length(trim(message)) > 0);

ALTER TABLE messaging_payments
    ADD CONSTRAINT positive_messaging_payment
        CHECK (amount > 0);

ALTER TABLE reviews
    ADD CONSTRAINT valid_rating
        CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE hostels
    ADD COLUMN contact_phone     VARCHAR(30),
  ADD COLUMN deposit_amount DECIMAL(12, 2),
  ADD COLUMN other_fees TEXT;

ALTER TABLE hostels
    ADD CONSTRAINT non_negative_deposit
        CHECK (deposit_amount IS NULL OR deposit_amount >= 0);

ALTER TABLE reports
    ADD CONSTRAINT report_has_target
        CHECK (hostel_id IS NOT NULL OR reported_user_id IS NOT NULL),
    ADD CONSTRAINT valid_report_resolution
    CHECK (
        (status IN ('OPEN', 'UNDER_REVIEW') AND resolved_at IS NULL)
        OR
        (status IN ('RESOLVED', 'DISMISSED') AND resolved_at IS NOT NULL)
    );

-- ==================== BOOKING OVERLAP PROTECTION ====================
-- Prevents two PENDING/CONFIRMED bookings from occupying the same
-- space during overlapping periods. Requires btree_gist (loaded above).

ALTER TABLE bookings
    ADD CONSTRAINT no_overlapping_space_bookings
    EXCLUDE USING gist (
        space_id WITH =,
        daterange(
            start_date,
            COALESCE(end_date, '9999-12-31'::date),
            '[)'
        ) WITH &&
    )
    WHERE (status IN ('PENDING', 'CONFIRMED'));

-- ====================================================================
-- TRIGGER FUNCTIONS + TRIGGERS
-- ====================================================================

-- 1. Generic updated_at function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_room_spaces_updated_at
    BEFORE UPDATE ON room_spaces
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hostels_updated_at
    BEFORE UPDATE ON hostels
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- 2. Minimum messaging fee (K500)
CREATE OR REPLACE FUNCTION enforce_min_messaging_fee()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount < 500 THEN
        RAISE EXCEPTION 'Messaging fee must be at least K500 (got %)', NEW.amount;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_min_messaging_fee
    BEFORE INSERT OR UPDATE ON messaging_payments
                         FOR EACH ROW
                         EXECUTE FUNCTION enforce_min_messaging_fee();

-- 3. Unlock conversation after successful messaging payment
CREATE OR REPLACE FUNCTION unlock_conversation_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'SUCCESS' THEN
UPDATE conversations
SET is_unlocked = TRUE,
    unlocked_at = COALESCE(unlocked_at, CURRENT_TIMESTAMP)
WHERE id = NEW.conversation_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_unlock_conversation
    AFTER INSERT OR UPDATE OF payment_status ON messaging_payments
    FOR EACH ROW
    EXECUTE FUNCTION unlock_conversation_on_payment();

-- 4. Block messages until conversation is unlocked
CREATE OR REPLACE FUNCTION enforce_conversation_unlocked()
RETURNS TRIGGER AS $$
DECLARE
unlocked BOOLEAN;
BEGIN
SELECT is_unlocked INTO unlocked FROM conversations WHERE id = NEW.conversation_id;

IF NOT COALESCE(unlocked, FALSE) THEN
        RAISE EXCEPTION 'Conversation % is locked — student must pay the K500 messaging fee first', NEW.conversation_id;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_require_unlock
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION enforce_conversation_unlocked();

-- 5. Verify message sender belongs to conversation
CREATE OR REPLACE FUNCTION enforce_conversation_participant()
RETURNS TRIGGER AS $$
DECLARE
conversation_student UUID;
    conversation_owner UUID;
BEGIN
SELECT student_id, owner_id
INTO conversation_student, conversation_owner
FROM conversations
WHERE id = NEW.conversation_id;

IF NEW.sender_id IS DISTINCT FROM conversation_student
       AND NEW.sender_id IS DISTINCT FROM conversation_owner THEN
        RAISE EXCEPTION 'User % is not a participant in conversation %', NEW.sender_id, NEW.conversation_id;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_require_participant
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION enforce_conversation_participant();

-- 6. Reviews only after completed booking
CREATE OR REPLACE FUNCTION enforce_review_after_completed_booking()
RETURNS TRIGGER AS $$
DECLARE
booking_status_value booking_status;
    booking_hostel_id UUID;
BEGIN
SELECT b.status, h.id
INTO booking_status_value, booking_hostel_id
FROM bookings b
         JOIN room_spaces rs ON rs.id = b.space_id
         JOIN rooms r ON r.id = rs.room_id
         JOIN hostels h ON h.id = r.hostel_id
WHERE b.id = NEW.booking_id;

IF booking_status_value IS DISTINCT FROM 'COMPLETED' THEN
        RAISE EXCEPTION 'Reviews can only be submitted for completed bookings (booking % is %)',
            NEW.booking_id, booking_status_value;
END IF;

    IF NEW.hostel_id IS DISTINCT FROM booking_hostel_id THEN
        RAISE EXCEPTION 'Review hostel does not match the hostel associated with booking %', NEW.booking_id;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_requires_completed_booking
    BEFORE INSERT OR UPDATE ON reviews
                         FOR EACH ROW
                         EXECUTE FUNCTION enforce_review_after_completed_booking();

-- 7. Verify hostel owner has OWNER role
CREATE OR REPLACE FUNCTION enforce_hostel_owner()
RETURNS TRIGGER AS $$
DECLARE
owner_role_value user_role;
BEGIN
SELECT role INTO owner_role_value FROM users WHERE id = NEW.owner_id;

IF owner_role_value IS DISTINCT FROM 'OWNER' THEN
        RAISE EXCEPTION 'Hostel owner % must have the OWNER role', NEW.owner_id;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_hostel_requires_owner_role
    BEFORE INSERT OR UPDATE OF owner_id ON hostels
    FOR EACH ROW
    EXECUTE FUNCTION enforce_hostel_owner();

-- 8. Verify booking student has STUDENT role
CREATE OR REPLACE FUNCTION enforce_booking_student()
RETURNS TRIGGER AS $$
DECLARE
student_role_value user_role;
BEGIN
SELECT role INTO student_role_value FROM users WHERE id = NEW.student_id;

IF student_role_value IS DISTINCT FROM 'STUDENT' THEN
        RAISE EXCEPTION 'Booking student % must have the STUDENT role', NEW.student_id;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_requires_student_role
    BEFORE INSERT OR UPDATE OF student_id ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION enforce_booking_student();

-- 9. Verify conversation participants (roles + hostel ownership)
CREATE OR REPLACE FUNCTION enforce_conversation_participants()
RETURNS TRIGGER AS $$
DECLARE
student_role_value user_role;
    owner_role_value user_role;
    hostel_owner UUID;
BEGIN
SELECT role INTO student_role_value FROM users WHERE id = NEW.student_id;
IF student_role_value IS DISTINCT FROM 'STUDENT' THEN
        RAISE EXCEPTION 'Conversation student % must have the STUDENT role', NEW.student_id;
END IF;

SELECT role INTO owner_role_value FROM users WHERE id = NEW.owner_id;
IF owner_role_value IS DISTINCT FROM 'OWNER' THEN
        RAISE EXCEPTION 'Conversation owner % must have the OWNER role', NEW.owner_id;
END IF;

SELECT owner_id INTO hostel_owner FROM hostels WHERE id = NEW.hostel_id;
IF hostel_owner IS DISTINCT FROM NEW.owner_id THEN
        RAISE EXCEPTION 'Conversation owner must be the owner of the specified hostel';
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_conversation_participants
    BEFORE INSERT OR UPDATE ON conversations
                         FOR EACH ROW
                         EXECUTE FUNCTION enforce_conversation_participants();

-- 10. Booking price snapshot (fills monthly_price from room price if omitted)
CREATE OR REPLACE FUNCTION set_booking_price_snapshot()
RETURNS TRIGGER AS $$
DECLARE
room_price NUMERIC(12,2);
BEGIN
    IF TG_OP = 'INSERT' AND NEW.monthly_price IS NULL THEN
SELECT r.price_per_month
INTO room_price
FROM room_spaces rs
         JOIN rooms r ON r.id = rs.room_id
WHERE rs.id = NEW.space_id;

NEW.monthly_price = room_price;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_price_snapshot
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_price_snapshot();

-- 11. Verify owner verification review state
CREATE OR REPLACE FUNCTION validate_owner_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('VERIFIED', 'REJECTED') AND NEW.reviewed_at IS NULL THEN
        RAISE EXCEPTION 'A verification marked % must have reviewed_at', NEW.status;
END IF;

    IF NEW.status = 'PENDING' AND NEW.reviewed_at IS NOT NULL THEN
        RAISE EXCEPTION 'A PENDING verification cannot have reviewed_at';
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_owner_verification
    BEFORE INSERT OR UPDATE ON owner_verifications
                         FOR EACH ROW
                         EXECUTE FUNCTION validate_owner_verification();

-- 12. Validate report resolution
CREATE OR REPLACE FUNCTION validate_report_resolution()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('RESOLVED', 'DISMISSED') THEN
        IF NEW.resolved_at IS NULL THEN
            NEW.resolved_at = CURRENT_TIMESTAMP;
END IF;

        IF NEW.resolved_by IS NULL THEN
            RAISE EXCEPTION 'Resolved or dismissed reports must specify resolved_by';
END IF;
ELSE
        NEW.resolved_at = NULL;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_report_resolution
    BEFORE INSERT OR UPDATE ON reports
                         FOR EACH ROW
                         EXECUTE FUNCTION validate_report_resolution();

-- ====================================================================
-- END OF SCHEMA
-- ====================================================================


ALTER TABLE hostels
    ADD COLUMN distance_from_campus_km DECIMAL(5, 2);

ALTER TABLE hostels
    ADD CONSTRAINT non_negative_distance
        CHECK (distance_from_campus_km IS NULL OR distance_from_campus_km >= 0);

ALTER TABLE rooms
    ADD COLUMN room_type VARCHAR(50);

CREATE TABLE room_amenities (
                                room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
                                amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
                                PRIMARY KEY (room_id, amenity_id)
);

CREATE INDEX idx_room_amenities_room ON room_amenities(room_id);