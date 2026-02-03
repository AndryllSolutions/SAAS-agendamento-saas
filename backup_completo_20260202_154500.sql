--
-- PostgreSQL database dump
--

\restrict grv6Rartrlu9Kj5Qaek4CcbJoakUUVWGgDEPW7p9XZ5aXi2QFS68FYSxgBLgBTa

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: appointmentstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.appointmentstatus AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public.appointmentstatus OWNER TO agendamento_app;

--
-- Name: automatedcampaigntype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.automatedcampaigntype AS ENUM (
    'birthday',
    'reconquer',
    'reminder',
    'pre_care',
    'post_care',
    'return_guarantee',
    'status_update',
    'welcome',
    'invite_online',
    'cashback',
    'package_expiring',
    'billing'
);


ALTER TYPE public.automatedcampaigntype OWNER TO agendamento_app;

--
-- Name: bookingflowtype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.bookingflowtype AS ENUM (
    'service_first',
    'professional_first'
);


ALTER TYPE public.bookingflowtype OWNER TO agendamento_app;

--
-- Name: campaignstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.campaignstatus AS ENUM (
    'ACTIVE',
    'PAUSED',
    'FINISHED',
    'CANCELLED'
);


ALTER TYPE public.campaignstatus OWNER TO agendamento_app;

--
-- Name: campaigntype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.campaigntype AS ENUM (
    'BIRTHDAY',
    'RECONQUER',
    'REMINDER',
    'CARE',
    'RETURN',
    'INFORMED',
    'WELCOME',
    'INVITE_ONLINE',
    'CUSTOM'
);


ALTER TYPE public.campaigntype OWNER TO agendamento_app;

--
-- Name: cashbackruletype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.cashbackruletype AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


ALTER TYPE public.cashbackruletype OWNER TO agendamento_app;

--
-- Name: commanditemtype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.commanditemtype AS ENUM (
    'SERVICE',
    'PRODUCT',
    'PACKAGE'
);


ALTER TYPE public.commanditemtype OWNER TO agendamento_app;

--
-- Name: commandstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.commandstatus AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'FINISHED',
    'CANCELLED'
);


ALTER TYPE public.commandstatus OWNER TO agendamento_app;

--
-- Name: commissionstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.commissionstatus AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public.commissionstatus OWNER TO agendamento_app;

--
-- Name: company_role; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.company_role AS ENUM (
    'COMPANY_OWNER',
    'COMPANY_MANAGER',
    'COMPANY_OPERATOR',
    'COMPANY_PROFESSIONAL',
    'COMPANY_RECEPTIONIST',
    'COMPANY_FINANCE',
    'COMPANY_CLIENT',
    'COMPANY_READ_ONLY'
);


ALTER TYPE public.company_role OWNER TO agendamento_app;

--
-- Name: companytype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.companytype AS ENUM (
    'pessoa_fisica',
    'pessoa_juridica'
);


ALTER TYPE public.companytype OWNER TO agendamento_app;

--
-- Name: country; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.country AS ENUM (
    'BR',
    'AR',
    'CL',
    'US'
);


ALTER TYPE public.country OWNER TO agendamento_app;

--
-- Name: currency; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.currency AS ENUM (
    'BRL',
    'USD',
    'EUR',
    'ARS',
    'CLP'
);


ALTER TYPE public.currency OWNER TO agendamento_app;

--
-- Name: goaltype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.goaltype AS ENUM (
    'REVENUE',
    'APPOINTMENTS',
    'PRODUCT_SALES',
    'SERVICES',
    'OTHER'
);


ALTER TYPE public.goaltype OWNER TO agendamento_app;

--
-- Name: invoicestatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.invoicestatus AS ENUM (
    'PENDING',
    'GENERATED',
    'SENT',
    'CANCELLED',
    'ERROR'
);


ALTER TYPE public.invoicestatus OWNER TO agendamento_app;

--
-- Name: invoicetype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.invoicetype AS ENUM (
    'NFSE',
    'NFE',
    'NFCE'
);


ALTER TYPE public.invoicetype OWNER TO agendamento_app;

--
-- Name: language; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.language AS ENUM (
    'pt_BR',
    'es',
    'en'
);


ALTER TYPE public.language OWNER TO agendamento_app;

--
-- Name: logstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.logstatus AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'ERROR'
);


ALTER TYPE public.logstatus OWNER TO agendamento_app;

--
-- Name: notificationchannel; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.notificationchannel AS ENUM (
    'EMAIL',
    'SMS',
    'WHATSAPP',
    'PUSH',
    'IN_APP'
);


ALTER TYPE public.notificationchannel OWNER TO agendamento_app;

--
-- Name: notificationeventtype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.notificationeventtype AS ENUM (
    'APPOINTMENT_CREATED',
    'APPOINTMENT_UPDATED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_CONFIRMED',
    'PAYMENT_RECEIVED',
    'PAYMENT_FAILED',
    'COMMAND_CREATED',
    'COMMAND_CLOSED',
    'PACKAGE_EXPIRING',
    'PACKAGE_EXPIRED',
    'WELCOME_MESSAGE',
    'BIRTHDAY',
    'REVIEW_REQUEST',
    'CUSTOM'
);


ALTER TYPE public.notificationeventtype OWNER TO agendamento_app;

--
-- Name: notificationstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.notificationstatus AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'READ'
);


ALTER TYPE public.notificationstatus OWNER TO agendamento_app;

--
-- Name: notificationtype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.notificationtype AS ENUM (
    'EMAIL',
    'SMS',
    'WHATSAPP',
    'PUSH',
    'IN_APP'
);


ALTER TYPE public.notificationtype OWNER TO agendamento_app;

--
-- Name: packagestatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.packagestatus AS ENUM (
    'ACTIVE',
    'EXPIRED',
    'EXHAUSTED'
);


ALTER TYPE public.packagestatus OWNER TO agendamento_app;

--
-- Name: paymentmethod; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.paymentmethod AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'PIX',
    'BOLETO',
    'PAYPAL',
    'MERCADOPAGO',
    'STRIPE'
);


ALTER TYPE public.paymentmethod OWNER TO agendamento_app;

--
-- Name: paymentstatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.paymentstatus AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);


ALTER TYPE public.paymentstatus OWNER TO agendamento_app;

--
-- Name: promotiontype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.promotiontype AS ENUM (
    'DISCOUNT_PERCENTAGE',
    'DISCOUNT_FIXED',
    'BUY_ONE_GET_ONE',
    'FREE_SERVICE',
    'OTHER'
);


ALTER TYPE public.promotiontype OWNER TO agendamento_app;

--
-- Name: purchasestatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.purchasestatus AS ENUM (
    'OPEN',
    'FINISHED',
    'CANCELLED'
);


ALTER TYPE public.purchasestatus OWNER TO agendamento_app;

--
-- Name: resourcetype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.resourcetype AS ENUM (
    'ROOM',
    'CHAIR',
    'EQUIPMENT',
    'VEHICLE',
    'OTHER'
);


ALTER TYPE public.resourcetype OWNER TO agendamento_app;

--
-- Name: subscriptionsalestatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.subscriptionsalestatus AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'CANCELLED',
    'EXPIRED'
);


ALTER TYPE public.subscriptionsalestatus OWNER TO agendamento_app;

--
-- Name: themetype; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.themetype AS ENUM (
    'light',
    'dark',
    'optional'
);


ALTER TYPE public.themetype OWNER TO agendamento_app;

--
-- Name: triggercondition; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.triggercondition AS ENUM (
    'IMMEDIATE',
    'BEFORE_EVENT',
    'AFTER_EVENT',
    'DAILY',
    'WEEKLY',
    'MONTHLY'
);


ALTER TYPE public.triggercondition OWNER TO agendamento_app;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.userrole AS ENUM (
    'SAAS_ADMIN',
    'OWNER',
    'MANAGER',
    'PROFESSIONAL',
    'RECEPTIONIST',
    'FINANCE',
    'CLIENT',
    'READ_ONLY',
    'ADMIN',
    'STAFF'
);


ALTER TYPE public.userrole OWNER TO agendamento_app;

--
-- Name: waitliststatus; Type: TYPE; Schema: public; Owner: agendamento_app
--

CREATE TYPE public.waitliststatus AS ENUM (
    'WAITING',
    'NOTIFIED',
    'ACCEPTED',
    'EXPIRED',
    'CANCELLED'
);


ALTER TYPE public.waitliststatus OWNER TO agendamento_app;

--
-- Name: get_current_company_id(); Type: FUNCTION; Schema: public; Owner: agendamento_app
--

CREATE FUNCTION public.get_current_company_id() RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
        BEGIN
            RETURN NULLIF(current_setting('app.current_company_id', TRUE), '')::INTEGER;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN NULL;
        END;
        $$;


ALTER FUNCTION public.get_current_company_id() OWNER TO agendamento_app;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: add_ons; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.add_ons (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    price_monthly numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'BRL'::character varying NOT NULL,
    addon_type character varying(50) NOT NULL,
    config json DEFAULT '{}'::json NOT NULL,
    unlocks_features json,
    override_limits json,
    icon character varying(50),
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    category character varying(50),
    display_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    included_in_plans json
);


ALTER TABLE public.add_ons OWNER TO agendamento_app;

--
-- Name: add_ons_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.add_ons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.add_ons_id_seq OWNER TO agendamento_app;

--
-- Name: add_ons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.add_ons_id_seq OWNED BY public.add_ons.id;


--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO agendamento_app;

--
-- Name: anamneses; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.anamneses (
    company_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    professional_id integer,
    model_id integer NOT NULL,
    responses json NOT NULL,
    status character varying(20) NOT NULL,
    is_signed boolean,
    signature_date timestamp without time zone,
    signature_image_url character varying(500),
    signature_name character varying(255),
    signature_ip character varying(50),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.anamneses FORCE ROW LEVEL SECURITY;


ALTER TABLE public.anamneses OWNER TO agendamento_app;

--
-- Name: anamneses_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.anamneses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.anamneses_id_seq OWNER TO agendamento_app;

--
-- Name: anamneses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.anamneses_id_seq OWNED BY public.anamneses.id;


--
-- Name: anamnesis_models; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.anamnesis_models (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    fields json NOT NULL,
    related_services json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.anamnesis_models FORCE ROW LEVEL SECURITY;


ALTER TABLE public.anamnesis_models OWNER TO agendamento_app;

--
-- Name: anamnesis_models_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.anamnesis_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.anamnesis_models_id_seq OWNER TO agendamento_app;

--
-- Name: anamnesis_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.anamnesis_models_id_seq OWNED BY public.anamnesis_models.id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.api_keys (
    company_id integer NOT NULL,
    user_id integer,
    name character varying(100) NOT NULL,
    key_prefix character varying(10) NOT NULL,
    key_hash character varying(255) NOT NULL,
    scopes text,
    is_active boolean NOT NULL,
    expires_at timestamp without time zone,
    last_used_at timestamp without time zone,
    usage_count integer,
    description text,
    ip_whitelist text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.api_keys FORCE ROW LEVEL SECURITY;


ALTER TABLE public.api_keys OWNER TO agendamento_app;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.api_keys_id_seq OWNER TO agendamento_app;

--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.appointments (
    company_id integer NOT NULL,
    client_crm_id integer,
    professional_id integer,
    service_id integer,
    resource_id integer,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    status public.appointmentstatus NOT NULL,
    client_notes text,
    professional_notes text,
    internal_notes text,
    cancelled_at timestamp without time zone,
    cancelled_by integer,
    cancellation_reason text,
    checked_in_at timestamp without time zone,
    check_in_code character varying(50),
    reminder_sent_24h boolean,
    reminder_sent_2h boolean,
    payment_status character varying(20),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.appointments FORCE ROW LEVEL SECURITY;


ALTER TABLE public.appointments OWNER TO agendamento_app;

--
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.appointments_id_seq OWNER TO agendamento_app;

--
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.brands (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    notes text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.brands OWNER TO agendamento_app;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.brands_id_seq OWNER TO agendamento_app;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: cash_registers; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.cash_registers (
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    opening_date timestamp without time zone NOT NULL,
    opening_balance numeric(10,2),
    closing_date timestamp without time zone,
    closing_balance numeric(10,2),
    payment_summary json,
    is_open boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.cash_registers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.cash_registers OWNER TO agendamento_app;

--
-- Name: cash_registers_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.cash_registers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cash_registers_id_seq OWNER TO agendamento_app;

--
-- Name: cash_registers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.cash_registers_id_seq OWNED BY public.cash_registers.id;


--
-- Name: cashback_balances; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.cashback_balances (
    company_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    balance numeric(10,2),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.cashback_balances FORCE ROW LEVEL SECURITY;


ALTER TABLE public.cashback_balances OWNER TO agendamento_app;

--
-- Name: cashback_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.cashback_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cashback_balances_id_seq OWNER TO agendamento_app;

--
-- Name: cashback_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.cashback_balances_id_seq OWNED BY public.cashback_balances.id;


--
-- Name: cashback_rules; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.cashback_rules (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    rule_type public.cashbackruletype NOT NULL,
    value numeric(10,2) NOT NULL,
    applies_to_products boolean,
    applies_to_services boolean,
    specific_items json,
    client_filters json,
    valid_from timestamp without time zone,
    valid_until timestamp without time zone,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.cashback_rules FORCE ROW LEVEL SECURITY;


ALTER TABLE public.cashback_rules OWNER TO agendamento_app;

--
-- Name: cashback_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.cashback_rules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cashback_rules_id_seq OWNER TO agendamento_app;

--
-- Name: cashback_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.cashback_rules_id_seq OWNED BY public.cashback_rules.id;


--
-- Name: cashback_transactions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.cashback_transactions (
    company_id integer NOT NULL,
    balance_id integer NOT NULL,
    rule_id integer,
    command_id integer,
    value numeric(10,2) NOT NULL,
    transaction_type character varying(20) NOT NULL,
    description text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.cashback_transactions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.cashback_transactions OWNER TO agendamento_app;

--
-- Name: cashback_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.cashback_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cashback_transactions_id_seq OWNER TO agendamento_app;

--
-- Name: cashback_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.cashback_transactions_id_seq OWNED BY public.cashback_transactions.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.clients (
    company_id integer NOT NULL,
    user_id integer,
    full_name character varying(255) NOT NULL,
    nickname character varying(100),
    email character varying(255),
    phone character varying(20),
    cellphone character varying(20),
    date_of_birth date,
    cpf character varying(20),
    cnpj character varying(20),
    address character varying(500),
    address_number character varying(20),
    address_complement character varying(100),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(2),
    zip_code character varying(10),
    credits numeric(10,2),
    marketing_whatsapp boolean,
    marketing_email boolean,
    is_active boolean,
    notes text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.clients FORCE ROW LEVEL SECURITY;


ALTER TABLE public.clients OWNER TO agendamento_app;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clients_id_seq OWNER TO agendamento_app;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: command_items; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.command_items (
    command_id integer NOT NULL,
    item_type public.commanditemtype NOT NULL,
    reference_id integer NOT NULL,
    service_id integer,
    product_id integer,
    package_id integer,
    professional_id integer,
    quantity integer,
    unit_value numeric(10,2) NOT NULL,
    total_value numeric(10,2) NOT NULL,
    commission_percentage integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.command_items OWNER TO agendamento_app;

--
-- Name: command_items_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.command_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.command_items_id_seq OWNER TO agendamento_app;

--
-- Name: command_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.command_items_id_seq OWNED BY public.command_items.id;


--
-- Name: commands; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.commands (
    company_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    professional_id integer,
    appointment_id integer,
    number character varying(50) NOT NULL,
    date timestamp without time zone NOT NULL,
    status public.commandstatus NOT NULL,
    total_value numeric(10,2),
    discount_value numeric(10,2),
    net_value numeric(10,2),
    payment_summary character varying(255),
    payment_blocked boolean,
    payment_received boolean,
    has_nfse boolean,
    has_nfe boolean,
    has_nfce boolean,
    notes text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.commands FORCE ROW LEVEL SECURITY;


ALTER TABLE public.commands OWNER TO agendamento_app;

--
-- Name: commands_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.commands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.commands_id_seq OWNER TO agendamento_app;

--
-- Name: commands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.commands_id_seq OWNED BY public.commands.id;


--
-- Name: commission_configs; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.commission_configs (
    company_id integer NOT NULL,
    date_filter_type character varying(50) NOT NULL,
    command_type_filter character varying(50) NOT NULL,
    fees_responsibility character varying(50) NOT NULL,
    discounts_responsibility character varying(50) NOT NULL,
    deduct_additional_service_cost boolean NOT NULL,
    product_discount_origin character varying(50) NOT NULL,
    discount_products_from character varying(50),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.commission_configs FORCE ROW LEVEL SECURITY;


ALTER TABLE public.commission_configs OWNER TO agendamento_app;

--
-- Name: commission_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.commission_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.commission_configs_id_seq OWNER TO agendamento_app;

--
-- Name: commission_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.commission_configs_id_seq OWNED BY public.commission_configs.id;


--
-- Name: commissions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.commissions (
    company_id integer NOT NULL,
    command_id integer NOT NULL,
    command_item_id integer,
    professional_id integer NOT NULL,
    base_value numeric(10,2) NOT NULL,
    commission_percentage integer NOT NULL,
    commission_value numeric(10,2) NOT NULL,
    status public.commissionstatus NOT NULL,
    paid_at timestamp without time zone,
    payment_notes text,
    financial_transaction_id integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.commissions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.commissions OWNER TO agendamento_app;

--
-- Name: commissions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.commissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.commissions_id_seq OWNER TO agendamento_app;

--
-- Name: commissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.commissions_id_seq OWNED BY public.commissions.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.companies (
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    email character varying(255) NOT NULL,
    phone character varying(20),
    website character varying(255),
    address character varying(500),
    address_number character varying(20),
    address_complement character varying(100),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(2),
    country character varying(100),
    postal_code character varying(20),
    company_type character varying(20),
    cpf character varying(20),
    cnpj character varying(18),
    trade_name character varying(255),
    municipal_registration character varying(50),
    state_registration character varying(50),
    whatsapp character varying(20),
    business_hours json,
    timezone character varying(50),
    currency character varying(3),
    business_type character varying(50),
    team_size character varying(20),
    logo_url character varying(500),
    primary_color character varying(7),
    secondary_color character varying(7),
    is_active boolean,
    subscription_plan character varying(50),
    subscription_expires_at timestamp without time zone,
    features json,
    settings json,
    online_booking_enabled boolean,
    online_booking_url character varying(255),
    online_booking_description text,
    online_booking_gallery json,
    online_booking_social_media json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    subscription_plan_id integer
);


ALTER TABLE public.companies OWNER TO agendamento_app;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.companies_id_seq OWNER TO agendamento_app;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_add_ons; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_add_ons (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    company_id integer NOT NULL,
    addon_id integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    activated_at timestamp without time zone,
    deactivated_at timestamp without time zone,
    next_billing_date timestamp without time zone,
    auto_renew boolean DEFAULT true NOT NULL,
    source character varying(50),
    trial_end_date timestamp without time zone,
    is_trial boolean DEFAULT false NOT NULL
);


ALTER TABLE public.company_add_ons OWNER TO agendamento_app;

--
-- Name: company_add_ons_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_add_ons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_add_ons_id_seq OWNER TO agendamento_app;

--
-- Name: company_add_ons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_add_ons_id_seq OWNED BY public.company_add_ons.id;


--
-- Name: company_admin_settings; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_admin_settings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    default_message_language public.language NOT NULL,
    currency public.currency NOT NULL,
    country public.country NOT NULL,
    timezone character varying(50) DEFAULT 'America/Sao_Paulo'::character varying NOT NULL,
    date_format character varying(20) DEFAULT 'DD/MM/YYYY'::character varying NOT NULL,
    time_format character varying(20) DEFAULT 'HH:mm'::character varying NOT NULL,
    additional_settings json,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.company_admin_settings OWNER TO agendamento_app;

--
-- Name: company_admin_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_admin_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_admin_settings_id_seq OWNER TO agendamento_app;

--
-- Name: company_admin_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_admin_settings_id_seq OWNED BY public.company_admin_settings.id;


--
-- Name: company_details; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_details (
    id integer NOT NULL,
    company_id integer NOT NULL,
    company_type public.companytype NOT NULL,
    document_number character varying(20),
    company_name character varying(255),
    municipal_registration character varying(50),
    state_registration character varying(50),
    email character varying(255),
    phone character varying(20),
    whatsapp character varying(20),
    postal_code character varying(20),
    address character varying(500),
    address_number character varying(20),
    address_complement character varying(100),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(2),
    country character varying(2),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.company_details OWNER TO agendamento_app;

--
-- Name: company_details_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_details_id_seq OWNER TO agendamento_app;

--
-- Name: company_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_details_id_seq OWNED BY public.company_details.id;


--
-- Name: company_financial_settings; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_financial_settings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    allow_retroactive_entries boolean DEFAULT false NOT NULL,
    allow_invoice_edit_after_conference boolean DEFAULT false NOT NULL,
    edit_only_value_after_conference boolean DEFAULT true NOT NULL,
    allow_operations_with_closed_cash boolean DEFAULT false NOT NULL,
    require_category_on_transaction boolean DEFAULT true NOT NULL,
    require_payment_form_on_transaction boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.company_financial_settings OWNER TO agendamento_app;

--
-- Name: company_financial_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_financial_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_financial_settings_id_seq OWNER TO agendamento_app;

--
-- Name: company_financial_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_financial_settings_id_seq OWNED BY public.company_financial_settings.id;


--
-- Name: company_notification_settings; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_notification_settings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    notify_new_appointment boolean DEFAULT true NOT NULL,
    notify_appointment_cancellation boolean DEFAULT true NOT NULL,
    notify_appointment_deletion boolean DEFAULT true NOT NULL,
    notify_new_review boolean DEFAULT true NOT NULL,
    notify_sms_response boolean DEFAULT false NOT NULL,
    notify_client_return boolean DEFAULT true NOT NULL,
    notify_goal_achievement boolean DEFAULT true NOT NULL,
    notify_client_waiting boolean DEFAULT true NOT NULL,
    notification_sound_enabled boolean DEFAULT true NOT NULL,
    notification_duration_seconds integer DEFAULT 5 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.company_notification_settings OWNER TO agendamento_app;

--
-- Name: company_notification_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_notification_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_notification_settings_id_seq OWNER TO agendamento_app;

--
-- Name: company_notification_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_notification_settings_id_seq OWNED BY public.company_notification_settings.id;


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_settings (
    company_id integer NOT NULL,
    email_config text,
    sms_config text,
    whatsapp_config text,
    vapid_config text,
    general_settings json,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.company_settings FORCE ROW LEVEL SECURITY;


ALTER TABLE public.company_settings OWNER TO agendamento_app;

--
-- Name: company_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_settings_id_seq OWNER TO agendamento_app;

--
-- Name: company_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_settings_id_seq OWNED BY public.company_settings.id;


--
-- Name: company_subscriptions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_subscriptions (
    company_id integer NOT NULL,
    plan_type character varying(50) NOT NULL,
    trial_end_date timestamp without time zone,
    coupon_code character varying(100),
    referral_code character varying(100),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);

ALTER TABLE ONLY public.company_subscriptions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.company_subscriptions OWNER TO agendamento_app;

--
-- Name: company_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_subscriptions_id_seq OWNER TO agendamento_app;

--
-- Name: company_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_subscriptions_id_seq OWNED BY public.company_subscriptions.id;


--
-- Name: company_theme_settings; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_theme_settings (
    id integer NOT NULL,
    company_id integer NOT NULL,
    interface_language public.language NOT NULL,
    sidebar_color character varying(7) DEFAULT '#6366f1'::character varying NOT NULL,
    theme_mode character varying(20) DEFAULT 'light'::character varying NOT NULL,
    custom_logo_url character varying(500),
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.company_theme_settings OWNER TO agendamento_app;

--
-- Name: company_theme_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_theme_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_theme_settings_id_seq OWNER TO agendamento_app;

--
-- Name: company_theme_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_theme_settings_id_seq OWNED BY public.company_theme_settings.id;


--
-- Name: company_users; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.company_users (
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    role public.company_role NOT NULL,
    is_active character varying(20) NOT NULL,
    invited_by_id integer,
    invited_at timestamp without time zone,
    joined_at timestamp without time zone,
    last_active_at timestamp without time zone,
    notes character varying(500),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.company_users FORCE ROW LEVEL SECURITY;


ALTER TABLE public.company_users OWNER TO agendamento_app;

--
-- Name: company_users_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.company_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.company_users_id_seq OWNER TO agendamento_app;

--
-- Name: company_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.company_users_id_seq OWNED BY public.company_users.id;


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.document_templates (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    document_type character varying(50) NOT NULL,
    template_content text NOT NULL,
    variables json,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.document_templates FORCE ROW LEVEL SECURITY;


ALTER TABLE public.document_templates OWNER TO agendamento_app;

--
-- Name: document_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.document_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.document_templates_id_seq OWNER TO agendamento_app;

--
-- Name: document_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.document_templates_id_seq OWNED BY public.document_templates.id;


--
-- Name: evaluations; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.evaluations (
    company_id integer NOT NULL,
    client_id integer NOT NULL,
    professional_id integer,
    appointment_id integer,
    rating integer NOT NULL,
    comment text,
    origin character varying(50) NOT NULL,
    is_answered boolean,
    answer_date timestamp without time zone,
    answer_text text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.evaluations FORCE ROW LEVEL SECURITY;


ALTER TABLE public.evaluations OWNER TO agendamento_app;

--
-- Name: evaluations_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.evaluations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluations_id_seq OWNER TO agendamento_app;

--
-- Name: evaluations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.evaluations_id_seq OWNED BY public.evaluations.id;


--
-- Name: financial_accounts; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.financial_accounts (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    account_type character varying(50) NOT NULL,
    balance numeric(10,2),
    is_active boolean,
    admin_only boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.financial_accounts FORCE ROW LEVEL SECURITY;


ALTER TABLE public.financial_accounts OWNER TO agendamento_app;

--
-- Name: financial_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.financial_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financial_accounts_id_seq OWNER TO agendamento_app;

--
-- Name: financial_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.financial_accounts_id_seq OWNED BY public.financial_accounts.id;


--
-- Name: financial_categories; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.financial_categories (
    company_id integer NOT NULL,
    parent_id integer,
    name character varying(255) NOT NULL,
    type character varying(20) NOT NULL,
    description text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.financial_categories FORCE ROW LEVEL SECURITY;


ALTER TABLE public.financial_categories OWNER TO agendamento_app;

--
-- Name: financial_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.financial_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financial_categories_id_seq OWNER TO agendamento_app;

--
-- Name: financial_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.financial_categories_id_seq OWNED BY public.financial_categories.id;


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.financial_transactions (
    company_id integer NOT NULL,
    account_id integer,
    category_id integer,
    client_id integer,
    origin character varying(50) NOT NULL,
    command_id integer,
    purchase_id integer,
    subscription_sale_id integer,
    payment_id integer,
    invoice_id integer,
    professional_id integer,
    type character varying(20) NOT NULL,
    value numeric(10,2) NOT NULL,
    net_value numeric(10,2),
    fee_percentage numeric(5,2),
    fee_value numeric(10,2),
    date timestamp without time zone NOT NULL,
    description text,
    payment_method character varying(50),
    status character varying(20) NOT NULL,
    is_paid boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.financial_transactions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.financial_transactions OWNER TO agendamento_app;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.financial_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.financial_transactions_id_seq OWNER TO agendamento_app;

--
-- Name: financial_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.financial_transactions_id_seq OWNED BY public.financial_transactions.id;


--
-- Name: fiscal_configurations; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.fiscal_configurations (
    company_id integer NOT NULL,
    nfse_provider character varying(50),
    nfe_provider character varying(50),
    nfce_provider character varying(50),
    provider_api_key character varying(255),
    provider_api_secret character varying(255),
    environment character varying(20),
    auto_generate_nfse boolean,
    auto_generate_nfe boolean,
    auto_generate_nfce boolean,
    settings json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.fiscal_configurations OWNER TO agendamento_app;

--
-- Name: fiscal_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.fiscal_configurations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fiscal_configurations_id_seq OWNER TO agendamento_app;

--
-- Name: fiscal_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.fiscal_configurations_id_seq OWNED BY public.fiscal_configurations.id;


--
-- Name: generated_documents; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.generated_documents (
    company_id integer NOT NULL,
    template_id integer NOT NULL,
    client_crm_id integer,
    command_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    file_url character varying(500),
    variables_used json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.generated_documents FORCE ROW LEVEL SECURITY;


ALTER TABLE public.generated_documents OWNER TO agendamento_app;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.generated_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.generated_documents_id_seq OWNER TO agendamento_app;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.generated_documents_id_seq OWNED BY public.generated_documents.id;


--
-- Name: goals; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.goals (
    company_id integer NOT NULL,
    professional_id integer,
    type public.goaltype NOT NULL,
    target_value numeric(10,2) NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    description text,
    is_active boolean,
    current_value numeric(10,2),
    progress_percentage integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.goals FORCE ROW LEVEL SECURITY;


ALTER TABLE public.goals OWNER TO agendamento_app;

--
-- Name: goals_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.goals_id_seq OWNER TO agendamento_app;

--
-- Name: goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.invoices (
    company_id integer NOT NULL,
    command_id integer,
    client_crm_id integer,
    invoice_type public.invoicetype NOT NULL,
    number character varying(50),
    access_key character varying(50),
    provider character varying(50),
    provider_invoice_id character varying(255),
    status public.invoicestatus NOT NULL,
    total_value numeric(10,2) NOT NULL,
    issue_date timestamp without time zone,
    sent_date timestamp without time zone,
    xml_url character varying(500),
    pdf_url character varying(500),
    error_message text,
    provider_response json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.invoices FORCE ROW LEVEL SECURITY;


ALTER TABLE public.invoices OWNER TO agendamento_app;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invoices_id_seq OWNER TO agendamento_app;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: notification_queue; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.notification_queue (
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    trigger_id integer,
    template_id integer,
    channel public.notificationchannel NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    url character varying(500),
    icon character varying(500),
    scheduled_at timestamp without time zone NOT NULL,
    max_retries integer NOT NULL,
    retry_count integer NOT NULL,
    status character varying(20) NOT NULL,
    sent_at timestamp without time zone,
    error_message text,
    event_type character varying(50),
    reference_id integer,
    reference_type character varying(50),
    context_data json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.notification_queue OWNER TO agendamento_app;

--
-- Name: notification_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.notification_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_queue_id_seq OWNER TO agendamento_app;

--
-- Name: notification_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.notification_queue_id_seq OWNED BY public.notification_queue.id;


--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.notification_templates (
    company_id integer NOT NULL,
    created_by integer,
    name character varying(255) NOT NULL,
    description text,
    event_type public.notificationeventtype NOT NULL,
    channel public.notificationchannel NOT NULL,
    title_template character varying(255) NOT NULL,
    body_template text NOT NULL,
    url_template character varying(500),
    icon_url character varying(500),
    is_active boolean NOT NULL,
    is_default boolean NOT NULL,
    available_placeholders json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO agendamento_app;

--
-- Name: notification_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.notification_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_templates_id_seq OWNER TO agendamento_app;

--
-- Name: notification_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.notification_templates_id_seq OWNED BY public.notification_templates.id;


--
-- Name: notification_triggers; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.notification_triggers (
    company_id integer NOT NULL,
    template_id integer NOT NULL,
    created_by integer,
    name character varying(255) NOT NULL,
    event_type public.notificationeventtype NOT NULL,
    trigger_condition public.triggercondition NOT NULL,
    trigger_offset_minutes integer,
    trigger_time character varying(10),
    trigger_day_of_week integer,
    trigger_day_of_month integer,
    filters json,
    target_roles json,
    send_to_client boolean NOT NULL,
    send_to_professional boolean NOT NULL,
    send_to_manager boolean NOT NULL,
    is_active boolean NOT NULL,
    last_triggered_at timestamp without time zone,
    trigger_count integer NOT NULL,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.notification_triggers OWNER TO agendamento_app;

--
-- Name: notification_triggers_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.notification_triggers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_triggers_id_seq OWNER TO agendamento_app;

--
-- Name: notification_triggers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.notification_triggers_id_seq OWNED BY public.notification_triggers.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.notifications (
    user_id integer NOT NULL,
    notification_type public.notificationchannel NOT NULL,
    status public.notificationstatus NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    data character varying(1000),
    recipient character varying(255) NOT NULL,
    sent_at timestamp without time zone,
    read_at timestamp without time zone,
    error_message text,
    retry_count integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO agendamento_app;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO agendamento_app;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: online_booking_business_hours; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.online_booking_business_hours (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    company_id integer NOT NULL,
    config_id integer NOT NULL,
    day_of_week integer NOT NULL,
    is_active boolean,
    start_time character varying(5),
    break_start_time character varying(5),
    break_end_time character varying(5),
    end_time character varying(5)
);


ALTER TABLE public.online_booking_business_hours OWNER TO agendamento_app;

--
-- Name: online_booking_business_hours_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.online_booking_business_hours_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.online_booking_business_hours_id_seq OWNER TO agendamento_app;

--
-- Name: online_booking_business_hours_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.online_booking_business_hours_id_seq OWNED BY public.online_booking_business_hours.id;


--
-- Name: online_booking_configs; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.online_booking_configs (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    company_id integer NOT NULL,
    public_name character varying(255),
    public_description text,
    logo_url character varying(500),
    use_company_address boolean,
    public_address character varying(500),
    public_address_number character varying(20),
    public_address_complement character varying(100),
    public_neighborhood character varying(100),
    public_city character varying(100),
    public_state character varying(2),
    public_postal_code character varying(20),
    public_whatsapp character varying(20),
    public_phone character varying(20),
    public_instagram character varying(255),
    public_facebook character varying(255),
    public_website character varying(255),
    primary_color character varying(7),
    theme public.themetype,
    booking_flow public.bookingflowtype,
    require_login boolean,
    min_advance_time_minutes integer,
    allow_cancellation boolean,
    cancellation_min_hours integer,
    enable_payment_local boolean,
    enable_payment_card boolean,
    enable_payment_pix boolean,
    enable_deposit_payment boolean,
    deposit_percentage double precision,
    is_active boolean,
    settings json
);

ALTER TABLE ONLY public.online_booking_configs FORCE ROW LEVEL SECURITY;


ALTER TABLE public.online_booking_configs OWNER TO agendamento_app;

--
-- Name: online_booking_configs_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.online_booking_configs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.online_booking_configs_id_seq OWNER TO agendamento_app;

--
-- Name: online_booking_configs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.online_booking_configs_id_seq OWNED BY public.online_booking_configs.id;


--
-- Name: online_booking_gallery; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.online_booking_gallery (
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    company_id integer NOT NULL,
    config_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    display_order integer,
    is_active boolean
);


ALTER TABLE public.online_booking_gallery OWNER TO agendamento_app;

--
-- Name: online_booking_gallery_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.online_booking_gallery_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.online_booking_gallery_id_seq OWNER TO agendamento_app;

--
-- Name: online_booking_gallery_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.online_booking_gallery_id_seq OWNED BY public.online_booking_gallery.id;


--
-- Name: package_plans; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.package_plans (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency character varying(3),
    sessions_included integer NOT NULL,
    validity_days integer NOT NULL,
    service_ids json,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.package_plans OWNER TO agendamento_app;

--
-- Name: packages; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.packages (
    company_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    predefined_package_id integer NOT NULL,
    sale_date timestamp without time zone NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    status public.packagestatus NOT NULL,
    sessions_balance json NOT NULL,
    paid_value numeric(10,2) NOT NULL,
    invoice_id integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.packages FORCE ROW LEVEL SECURITY;


ALTER TABLE public.packages OWNER TO agendamento_app;

--
-- Name: packages_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.packages_id_seq OWNER TO agendamento_app;

--
-- Name: packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.packages_id_seq OWNED BY public.packages.id;


--
-- Name: payment_forms; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.payment_forms (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    integrates_with_gateway boolean,
    gateway_name character varying(50),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.payment_forms FORCE ROW LEVEL SECURITY;


ALTER TABLE public.payment_forms OWNER TO agendamento_app;

--
-- Name: payment_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.payment_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_forms_id_seq OWNER TO agendamento_app;

--
-- Name: payment_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.payment_forms_id_seq OWNED BY public.payment_forms.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.payments (
    company_id integer NOT NULL,
    appointment_id integer,
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency character varying(3),
    payment_method public.paymentmethod NOT NULL,
    status public.paymentstatus NOT NULL,
    gateway character varying(50),
    gateway_transaction_id character varying(255),
    gateway_response json,
    pix_code text,
    pix_qr_code text,
    boleto_url character varying(500),
    boleto_barcode character varying(255),
    paid_at timestamp without time zone,
    refunded_at timestamp without time zone,
    commission_amount numeric(10,2),
    commission_paid boolean,
    notes text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO agendamento_app;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payments_id_seq OWNER TO agendamento_app;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.plans (
    id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    price_monthly numeric(10,2) NOT NULL,
    price_yearly numeric(10,2),
    currency character varying(3) DEFAULT 'BRL'::character varying NOT NULL,
    max_professionals integer NOT NULL,
    max_units integer DEFAULT 1 NOT NULL,
    max_clients integer DEFAULT '-1'::integer NOT NULL,
    max_appointments_per_month integer DEFAULT '-1'::integer NOT NULL,
    features json DEFAULT '[]'::json NOT NULL,
    highlight_label character varying(50),
    display_order integer DEFAULT 0 NOT NULL,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    is_active boolean DEFAULT true NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    trial_days integer DEFAULT 14 NOT NULL,
    price_min numeric(10,2),
    price_max numeric(10,2)
);


ALTER TABLE public.plans OWNER TO agendamento_app;

--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plans_id_seq OWNER TO agendamento_app;

--
-- Name: plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.plans_id_seq OWNED BY public.package_plans.id;


--
-- Name: plans_id_seq1; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.plans_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plans_id_seq1 OWNER TO agendamento_app;

--
-- Name: plans_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.plans_id_seq1 OWNED BY public.plans.id;


--
-- Name: predefined_packages; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.predefined_packages (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    services_included json NOT NULL,
    validity_days integer NOT NULL,
    total_value numeric(10,2) NOT NULL,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.predefined_packages OWNER TO agendamento_app;

--
-- Name: predefined_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.predefined_packages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.predefined_packages_id_seq OWNER TO agendamento_app;

--
-- Name: predefined_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.predefined_packages_id_seq OWNED BY public.predefined_packages.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.product_categories (
    company_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.product_categories FORCE ROW LEVEL SECURITY;


ALTER TABLE public.product_categories OWNER TO agendamento_app;

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_categories_id_seq OWNER TO agendamento_app;

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.products (
    company_id integer NOT NULL,
    brand_id integer,
    category_id integer,
    name character varying(255) NOT NULL,
    description text,
    stock_current integer,
    stock_minimum integer,
    unit character varying(20),
    cost_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    commission_percentage integer,
    barcode character varying(100),
    images json,
    image_url character varying(500),
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.products FORCE ROW LEVEL SECURITY;


ALTER TABLE public.products OWNER TO agendamento_app;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO agendamento_app;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promotions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.promotions (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type public.promotiontype NOT NULL,
    discount_value numeric(10,2),
    applies_to_services json,
    applies_to_products json,
    applies_to_clients json,
    valid_from timestamp without time zone NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    max_uses integer,
    max_uses_per_client integer,
    current_uses integer,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.promotions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.promotions OWNER TO agendamento_app;

--
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotions_id_seq OWNER TO agendamento_app;

--
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


--
-- Name: purchase_items; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.purchase_items (
    purchase_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL,
    total_cost numeric(10,2) NOT NULL,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.purchase_items OWNER TO agendamento_app;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.purchase_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchase_items_id_seq OWNER TO agendamento_app;

--
-- Name: purchase_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.purchase_items_id_seq OWNED BY public.purchase_items.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.purchases (
    company_id integer NOT NULL,
    supplier_id integer NOT NULL,
    number character varying(50) NOT NULL,
    purchase_date timestamp without time zone NOT NULL,
    total_value numeric(10,2),
    status public.purchasestatus NOT NULL,
    payment_method character varying(50),
    notes text,
    xml_imported boolean,
    xml_url character varying(500),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.purchases FORCE ROW LEVEL SECURITY;


ALTER TABLE public.purchases OWNER TO agendamento_app;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_id_seq OWNER TO agendamento_app;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: push_notification_logs; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.push_notification_logs (
    company_id integer NOT NULL,
    user_id integer,
    subscription_id integer,
    title character varying(255) NOT NULL,
    body text,
    url character varying(500),
    icon character varying(500),
    badge character varying(500),
    image character varying(500),
    tag character varying(100),
    notification_type character varying(50),
    reference_id integer,
    reference_type character varying(50),
    status character varying(20) NOT NULL,
    error_message text,
    response_status integer,
    response_body text,
    sent_at timestamp without time zone NOT NULL,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.push_notification_logs OWNER TO agendamento_app;

--
-- Name: push_notification_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.push_notification_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.push_notification_logs_id_seq OWNER TO agendamento_app;

--
-- Name: push_notification_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.push_notification_logs_id_seq OWNED BY public.push_notification_logs.id;


--
-- Name: resources; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.resources (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    resource_type public.resourcetype NOT NULL,
    is_active boolean,
    is_available boolean,
    location character varying(255),
    capacity integer,
    image_url character varying(500),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.resources FORCE ROW LEVEL SECURITY;


ALTER TABLE public.resources OWNER TO agendamento_app;

--
-- Name: resources_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.resources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.resources_id_seq OWNER TO agendamento_app;

--
-- Name: resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.resources_id_seq OWNED BY public.resources.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.reviews (
    company_id integer NOT NULL,
    appointment_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    professional_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    origin character varying(50) NOT NULL,
    is_visible boolean,
    is_approved boolean,
    response text,
    response_at character varying(50),
    is_answered boolean,
    answer_date timestamp without time zone,
    answer_text text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.reviews FORCE ROW LEVEL SECURITY;


ALTER TABLE public.reviews OWNER TO agendamento_app;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reviews_id_seq OWNER TO agendamento_app;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.service_categories (
    company_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    icon character varying(50),
    color character varying(7),
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.service_categories FORCE ROW LEVEL SECURITY;


ALTER TABLE public.service_categories OWNER TO agendamento_app;

--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_categories_id_seq OWNER TO agendamento_app;

--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: service_professionals; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.service_professionals (
    service_id integer NOT NULL,
    professional_id integer NOT NULL,
    is_active boolean,
    assigned_at timestamp without time zone DEFAULT now(),
    removed_at timestamp without time zone,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.service_professionals OWNER TO agendamento_app;

--
-- Name: service_professionals_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.service_professionals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.service_professionals_id_seq OWNER TO agendamento_app;

--
-- Name: service_professionals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.service_professionals_id_seq OWNED BY public.service_professionals.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.services (
    company_id integer NOT NULL,
    category_id integer,
    name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency character varying(3),
    duration_minutes integer NOT NULL,
    is_active boolean,
    requires_professional boolean,
    image_url character varying(500),
    color character varying(7),
    commission_rate integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    available_online boolean,
    online_booking_enabled boolean,
    extra_cost numeric(10,2),
    lead_time_minutes integer DEFAULT 0,
    is_favorite boolean DEFAULT false
);

ALTER TABLE ONLY public.services FORCE ROW LEVEL SECURITY;


ALTER TABLE public.services OWNER TO agendamento_app;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.services_id_seq OWNER TO agendamento_app;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: standalone_services; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.standalone_services (
    name character varying(200) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    price_min numeric(10,2),
    price_max numeric(10,2),
    currency character varying(3) NOT NULL,
    service_type character varying(50) NOT NULL,
    duration_days integer,
    includes json,
    is_active boolean NOT NULL,
    is_visible boolean NOT NULL,
    display_order integer NOT NULL,
    included_in_plans json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.standalone_services OWNER TO agendamento_app;

--
-- Name: standalone_services_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.standalone_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.standalone_services_id_seq OWNER TO agendamento_app;

--
-- Name: standalone_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.standalone_services_id_seq OWNED BY public.standalone_services.id;


--
-- Name: subscription_sale_models; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.subscription_sale_models (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    monthly_value numeric(10,2) NOT NULL,
    services_included json,
    credits_included numeric(10,2),
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.subscription_sale_models OWNER TO agendamento_app;

--
-- Name: subscription_sale_models_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.subscription_sale_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_sale_models_id_seq OWNER TO agendamento_app;

--
-- Name: subscription_sale_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.subscription_sale_models_id_seq OWNED BY public.subscription_sale_models.id;


--
-- Name: subscription_sales; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.subscription_sales (
    company_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    model_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone,
    status public.subscriptionsalestatus NOT NULL,
    current_month_credits_used numeric(10,2),
    current_month_services_used json,
    last_payment_date timestamp without time zone,
    next_payment_date timestamp without time zone,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.subscription_sales FORCE ROW LEVEL SECURITY;


ALTER TABLE public.subscription_sales OWNER TO agendamento_app;

--
-- Name: subscription_sales_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.subscription_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscription_sales_id_seq OWNER TO agendamento_app;

--
-- Name: subscription_sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.subscription_sales_id_seq OWNED BY public.subscription_sales.id;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.subscriptions (
    company_id integer NOT NULL,
    user_id integer NOT NULL,
    plan_id integer NOT NULL,
    is_active boolean,
    sessions_remaining integer NOT NULL,
    sessions_used integer,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    payment_id integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO agendamento_app;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.subscriptions_id_seq OWNER TO agendamento_app;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.suppliers (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(20),
    cellphone character varying(20),
    cpf character varying(20),
    cnpj character varying(20),
    address character varying(500),
    address_number character varying(20),
    address_complement character varying(100),
    neighborhood character varying(100),
    city character varying(100),
    state character varying(2),
    zip_code character varying(10),
    notes text,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.suppliers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.suppliers OWNER TO agendamento_app;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_id_seq OWNER TO agendamento_app;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: user_push_subscriptions; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.user_push_subscriptions (
    user_id integer NOT NULL,
    company_id integer NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    browser character varying(50),
    device_name character varying(100),
    user_agent text,
    is_active boolean NOT NULL,
    last_used_at timestamp without time zone,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.user_push_subscriptions FORCE ROW LEVEL SECURITY;


ALTER TABLE public.user_push_subscriptions OWNER TO agendamento_app;

--
-- Name: user_push_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.user_push_subscriptions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_push_subscriptions_id_seq OWNER TO agendamento_app;

--
-- Name: user_push_subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.user_push_subscriptions_id_seq OWNED BY public.user_push_subscriptions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.users (
    company_id integer,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    phone character varying(20),
    saas_role character varying(50),
    role public.userrole NOT NULL,
    is_active boolean,
    is_verified boolean,
    avatar_url character varying(500),
    bio text,
    date_of_birth character varying(50),
    gender character varying(20),
    address character varying(500),
    city character varying(100),
    state character varying(100),
    postal_code character varying(20),
    specialties json,
    working_hours json,
    commission_rate integer,
    oauth_provider character varying(50),
    oauth_id character varying(255),
    notification_preferences json,
    notes text,
    tags json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    cpf_cnpj character varying(20)
);


ALTER TABLE public.users OWNER TO agendamento_app;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO agendamento_app;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: waitlist; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.waitlist (
    company_id integer NOT NULL,
    client_id integer NOT NULL,
    client_crm_id integer,
    service_id integer NOT NULL,
    professional_id integer,
    preferred_date_start timestamp without time zone NOT NULL,
    preferred_date_end timestamp without time zone NOT NULL,
    status public.waitliststatus NOT NULL,
    priority integer,
    notified_at timestamp without time zone,
    expires_at timestamp without time zone,
    notes character varying(500),
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.waitlist OWNER TO agendamento_app;

--
-- Name: waitlist_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.waitlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.waitlist_id_seq OWNER TO agendamento_app;

--
-- Name: waitlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.waitlist_id_seq OWNED BY public.waitlist.id;


--
-- Name: whatsapp_automated_campaigns; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.whatsapp_automated_campaigns (
    id integer NOT NULL,
    company_id integer NOT NULL,
    campaign_type public.automatedcampaigntype NOT NULL,
    is_enabled boolean DEFAULT false NOT NULL,
    config json,
    message_template text,
    filters json,
    send_time_start character varying(5) DEFAULT '09:00'::character varying,
    send_time_end character varying(5) DEFAULT '18:00'::character varying,
    send_weekdays_only boolean DEFAULT true,
    total_triggered integer DEFAULT 0,
    total_sent integer DEFAULT 0,
    total_failed integer DEFAULT 0,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_configured boolean DEFAULT false
);

ALTER TABLE ONLY public.whatsapp_automated_campaigns FORCE ROW LEVEL SECURITY;


ALTER TABLE public.whatsapp_automated_campaigns OWNER TO agendamento_app;

--
-- Name: whatsapp_automated_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.whatsapp_automated_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_automated_campaigns_id_seq OWNER TO agendamento_app;

--
-- Name: whatsapp_automated_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.whatsapp_automated_campaigns_id_seq OWNED BY public.whatsapp_automated_campaigns.id;


--
-- Name: whatsapp_campaign_logs; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.whatsapp_campaign_logs (
    company_id integer NOT NULL,
    campaign_id integer NOT NULL,
    client_crm_id integer NOT NULL,
    phone_number character varying(20) NOT NULL,
    message_content text NOT NULL,
    status public.logstatus NOT NULL,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    read_at timestamp without time zone,
    error_message text,
    provider_response json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.whatsapp_campaign_logs FORCE ROW LEVEL SECURITY;


ALTER TABLE public.whatsapp_campaign_logs OWNER TO agendamento_app;

--
-- Name: whatsapp_campaign_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.whatsapp_campaign_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_campaign_logs_id_seq OWNER TO agendamento_app;

--
-- Name: whatsapp_campaign_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.whatsapp_campaign_logs_id_seq OWNED BY public.whatsapp_campaign_logs.id;


--
-- Name: whatsapp_campaign_triggers; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.whatsapp_campaign_triggers (
    id integer NOT NULL,
    company_id integer NOT NULL,
    automated_campaign_id integer NOT NULL,
    event_type character varying(100) NOT NULL,
    event_data json,
    client_id integer NOT NULL,
    phone_number character varying(20) NOT NULL,
    is_processed boolean DEFAULT false,
    is_sent boolean DEFAULT false,
    scheduled_for character varying(19),
    campaign_log_id integer,
    error_message text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.whatsapp_campaign_triggers OWNER TO agendamento_app;

--
-- Name: whatsapp_campaign_triggers_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.whatsapp_campaign_triggers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_campaign_triggers_id_seq OWNER TO agendamento_app;

--
-- Name: whatsapp_campaign_triggers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.whatsapp_campaign_triggers_id_seq OWNED BY public.whatsapp_campaign_triggers.id;


--
-- Name: whatsapp_campaigns; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.whatsapp_campaigns (
    company_id integer NOT NULL,
    template_id integer,
    name character varying(255) NOT NULL,
    description text,
    campaign_type public.campaigntype NOT NULL,
    content text,
    auto_send_enabled boolean,
    schedule_config json,
    client_filters json,
    status public.campaignstatus NOT NULL,
    total_sent integer,
    total_delivered integer,
    total_read integer,
    total_failed integer,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.whatsapp_campaigns FORCE ROW LEVEL SECURITY;


ALTER TABLE public.whatsapp_campaigns OWNER TO agendamento_app;

--
-- Name: whatsapp_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.whatsapp_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_campaigns_id_seq OWNER TO agendamento_app;

--
-- Name: whatsapp_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.whatsapp_campaigns_id_seq OWNED BY public.whatsapp_campaigns.id;


--
-- Name: whatsapp_providers; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.whatsapp_providers (
    company_id integer NOT NULL,
    provider_name character varying(50) NOT NULL,
    api_url character varying(500) NOT NULL,
    api_key character varying(255),
    api_secret character varying(255),
    instance_id character varying(255),
    is_active boolean,
    is_connected boolean,
    settings json,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);

ALTER TABLE ONLY public.whatsapp_providers FORCE ROW LEVEL SECURITY;


ALTER TABLE public.whatsapp_providers OWNER TO agendamento_app;

--
-- Name: whatsapp_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.whatsapp_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_providers_id_seq OWNER TO agendamento_app;

--
-- Name: whatsapp_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.whatsapp_providers_id_seq OWNED BY public.whatsapp_providers.id;


--
-- Name: whatsapp_templates; Type: TABLE; Schema: public; Owner: agendamento_app
--

CREATE TABLE public.whatsapp_templates (
    company_id integer NOT NULL,
    name character varying(255) NOT NULL,
    content text NOT NULL,
    available_variables json,
    is_active boolean,
    id integer NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.whatsapp_templates OWNER TO agendamento_app;

--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: agendamento_app
--

CREATE SEQUENCE public.whatsapp_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.whatsapp_templates_id_seq OWNER TO agendamento_app;

--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: agendamento_app
--

ALTER SEQUENCE public.whatsapp_templates_id_seq OWNED BY public.whatsapp_templates.id;


--
-- Name: add_ons id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.add_ons ALTER COLUMN id SET DEFAULT nextval('public.add_ons_id_seq'::regclass);


--
-- Name: anamneses id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamneses ALTER COLUMN id SET DEFAULT nextval('public.anamneses_id_seq'::regclass);


--
-- Name: anamnesis_models id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamnesis_models ALTER COLUMN id SET DEFAULT nextval('public.anamnesis_models_id_seq'::regclass);


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: cash_registers id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cash_registers ALTER COLUMN id SET DEFAULT nextval('public.cash_registers_id_seq'::regclass);


--
-- Name: cashback_balances id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_balances ALTER COLUMN id SET DEFAULT nextval('public.cashback_balances_id_seq'::regclass);


--
-- Name: cashback_rules id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_rules ALTER COLUMN id SET DEFAULT nextval('public.cashback_rules_id_seq'::regclass);


--
-- Name: cashback_transactions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_transactions ALTER COLUMN id SET DEFAULT nextval('public.cashback_transactions_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: command_items id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items ALTER COLUMN id SET DEFAULT nextval('public.command_items_id_seq'::regclass);


--
-- Name: commands id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commands ALTER COLUMN id SET DEFAULT nextval('public.commands_id_seq'::regclass);


--
-- Name: commission_configs id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commission_configs ALTER COLUMN id SET DEFAULT nextval('public.commission_configs_id_seq'::regclass);


--
-- Name: commissions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions ALTER COLUMN id SET DEFAULT nextval('public.commissions_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_add_ons id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_add_ons ALTER COLUMN id SET DEFAULT nextval('public.company_add_ons_id_seq'::regclass);


--
-- Name: company_admin_settings id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_admin_settings ALTER COLUMN id SET DEFAULT nextval('public.company_admin_settings_id_seq'::regclass);


--
-- Name: company_details id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_details ALTER COLUMN id SET DEFAULT nextval('public.company_details_id_seq'::regclass);


--
-- Name: company_financial_settings id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_financial_settings ALTER COLUMN id SET DEFAULT nextval('public.company_financial_settings_id_seq'::regclass);


--
-- Name: company_notification_settings id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_notification_settings ALTER COLUMN id SET DEFAULT nextval('public.company_notification_settings_id_seq'::regclass);


--
-- Name: company_settings id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_settings ALTER COLUMN id SET DEFAULT nextval('public.company_settings_id_seq'::regclass);


--
-- Name: company_subscriptions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.company_subscriptions_id_seq'::regclass);


--
-- Name: company_theme_settings id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_theme_settings ALTER COLUMN id SET DEFAULT nextval('public.company_theme_settings_id_seq'::regclass);


--
-- Name: company_users id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_users ALTER COLUMN id SET DEFAULT nextval('public.company_users_id_seq'::regclass);


--
-- Name: document_templates id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.document_templates ALTER COLUMN id SET DEFAULT nextval('public.document_templates_id_seq'::regclass);


--
-- Name: evaluations id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.evaluations ALTER COLUMN id SET DEFAULT nextval('public.evaluations_id_seq'::regclass);


--
-- Name: financial_accounts id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_accounts ALTER COLUMN id SET DEFAULT nextval('public.financial_accounts_id_seq'::regclass);


--
-- Name: financial_categories id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_categories ALTER COLUMN id SET DEFAULT nextval('public.financial_categories_id_seq'::regclass);


--
-- Name: financial_transactions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions ALTER COLUMN id SET DEFAULT nextval('public.financial_transactions_id_seq'::regclass);


--
-- Name: fiscal_configurations id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.fiscal_configurations ALTER COLUMN id SET DEFAULT nextval('public.fiscal_configurations_id_seq'::regclass);


--
-- Name: generated_documents id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.generated_documents ALTER COLUMN id SET DEFAULT nextval('public.generated_documents_id_seq'::regclass);


--
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: notification_queue id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_queue ALTER COLUMN id SET DEFAULT nextval('public.notification_queue_id_seq'::regclass);


--
-- Name: notification_templates id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_templates ALTER COLUMN id SET DEFAULT nextval('public.notification_templates_id_seq'::regclass);


--
-- Name: notification_triggers id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_triggers ALTER COLUMN id SET DEFAULT nextval('public.notification_triggers_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: online_booking_business_hours id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_business_hours ALTER COLUMN id SET DEFAULT nextval('public.online_booking_business_hours_id_seq'::regclass);


--
-- Name: online_booking_configs id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_configs ALTER COLUMN id SET DEFAULT nextval('public.online_booking_configs_id_seq'::regclass);


--
-- Name: online_booking_gallery id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_gallery ALTER COLUMN id SET DEFAULT nextval('public.online_booking_gallery_id_seq'::regclass);


--
-- Name: package_plans id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.package_plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq'::regclass);


--
-- Name: packages id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.packages ALTER COLUMN id SET DEFAULT nextval('public.packages_id_seq'::regclass);


--
-- Name: payment_forms id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payment_forms ALTER COLUMN id SET DEFAULT nextval('public.payment_forms_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: plans id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.plans ALTER COLUMN id SET DEFAULT nextval('public.plans_id_seq1'::regclass);


--
-- Name: predefined_packages id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.predefined_packages ALTER COLUMN id SET DEFAULT nextval('public.predefined_packages_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- Name: purchase_items id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchase_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_items_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: push_notification_logs id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.push_notification_logs ALTER COLUMN id SET DEFAULT nextval('public.push_notification_logs_id_seq'::regclass);


--
-- Name: resources id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.resources ALTER COLUMN id SET DEFAULT nextval('public.resources_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: service_professionals id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_professionals ALTER COLUMN id SET DEFAULT nextval('public.service_professionals_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: standalone_services id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.standalone_services ALTER COLUMN id SET DEFAULT nextval('public.standalone_services_id_seq'::regclass);


--
-- Name: subscription_sale_models id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sale_models ALTER COLUMN id SET DEFAULT nextval('public.subscription_sale_models_id_seq'::regclass);


--
-- Name: subscription_sales id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sales ALTER COLUMN id SET DEFAULT nextval('public.subscription_sales_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: user_push_subscriptions id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.user_push_subscriptions ALTER COLUMN id SET DEFAULT nextval('public.user_push_subscriptions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: waitlist id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist ALTER COLUMN id SET DEFAULT nextval('public.waitlist_id_seq'::regclass);


--
-- Name: whatsapp_automated_campaigns id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_automated_campaigns ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_automated_campaigns_id_seq'::regclass);


--
-- Name: whatsapp_campaign_logs id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_logs ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_campaign_logs_id_seq'::regclass);


--
-- Name: whatsapp_campaign_triggers id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_triggers ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_campaign_triggers_id_seq'::regclass);


--
-- Name: whatsapp_campaigns id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaigns ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_campaigns_id_seq'::regclass);


--
-- Name: whatsapp_providers id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_providers ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_providers_id_seq'::regclass);


--
-- Name: whatsapp_templates id; Type: DEFAULT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_templates ALTER COLUMN id SET DEFAULT nextval('public.whatsapp_templates_id_seq'::regclass);


--
-- Data for Name: add_ons; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.add_ons (id, created_at, updated_at, name, slug, description, price_monthly, currency, addon_type, config, unlocks_features, override_limits, icon, color, category, display_order, is_active, is_visible, included_in_plans) FROM stdin;
1	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Precificação Inteligente	pricing_intelligence	Cálculo automático de margem, preço mínimo e ideal por serviço	49.00	BRL	feature	{}	["pricing_intelligence", "cost_calculation", "margin_analysis"]	\N	TrendingUp	#10B981	analytics	1	t	t	["premium", "scale"]
2	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Relatórios Avançados	advanced_reports	Ticket médio, recorrência, cancelamentos, ranking detalhado	39.00	BRL	feature	{}	["advanced_reports", "ticket_average", "retention_analysis", "cancellation_analysis"]	\N	BarChart3	#6366F1	analytics	2	t	t	["premium", "scale"]
3	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Metas & Bonificação	goals_bonification	Metas por profissional, ranking, bonificação automática	39.00	BRL	feature	{}	["goals_advanced", "professional_ranking", "automatic_bonification"]	\N	Target	#F59E0B	management	3	t	t	["premium", "scale"]
4	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Marketing & Reativação (WhatsApp)	marketing_whatsapp	Mensagens automáticas, aniversário, lembretes, recuperação de inativos	59.00	BRL	feature	{}	["whatsapp_marketing", "automatic_messages", "birthday_campaigns", "inactive_recovery"]	\N	MessageSquare	#22C55E	marketing	4	t	t	["scale"]
5	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Unidade Extra	extra_unit	Gestão de unidade adicional	69.00	BRL	limit_override	{}	["multi_unit"]	\N	Building2	#8B5CF6	operations	5	t	t	[]
6	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Assinatura Digital	digital_signature	Assinatura de contratos e termos via WhatsApp	19.00	BRL	service	{}	["digital_signature", "contract_management"]	\N	FileSignature	#3B82F6	operations	6	t	t	[]
7	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Anamnese Inteligente	anamnesis_intelligent	Criação de formulários personalizados, histórico por cliente	29.00	BRL	feature	{}	["anamnesis_advanced", "custom_forms", "client_history"]	\N	ClipboardList	#EC4899	healthcare	7	t	t	[]
8	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Cashback & Fidelização	cashback_loyalty	Cashback por atendimento, controle de saldo	29.00	BRL	feature	{}	["cashback", "loyalty_program", "balance_control"]	\N	Gift	#F97316	marketing	8	t	t	[]
9	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Fiscal Pro	fiscal_pro	Emissão de NF-e, NFC-e, NFS-e	69.00	BRL	service	{}	["nfe_emission", "nfce_emission", "nfse_emission", "tax_compliance"]	\N	Receipt	#14B8A6	fiscal	9	t	t	[]
\.


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.alembic_version (version_num) FROM stdin;
\.


--
-- Data for Name: anamneses; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.anamneses (company_id, client_crm_id, professional_id, model_id, responses, status, is_signed, signature_date, signature_image_url, signature_name, signature_ip, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: anamnesis_models; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.anamnesis_models (company_id, name, fields, related_services, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.api_keys (company_id, user_id, name, key_prefix, key_hash, scopes, is_active, expires_at, last_used_at, usage_count, description, ip_whitelist, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.appointments (company_id, client_crm_id, professional_id, service_id, resource_id, start_time, end_time, status, client_notes, professional_notes, internal_notes, cancelled_at, cancelled_by, cancellation_reason, checked_in_at, check_in_code, reminder_sent_24h, reminder_sent_2h, payment_status, id, created_at, updated_at) FROM stdin;
2	1	2	1	1	2026-01-15 14:00:00	2026-01-15 14:30:00	CONFIRMED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-01-15 10:52:50.965908	2026-01-15 10:52:50.965908
2	2	2	2	2	2026-01-15 15:00:00	2026-01-15 15:45:00	CONFIRMED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-01-15 10:52:50.965908	2026-01-15 10:52:50.965908
2	3	2	3	3	2026-01-15 16:00:00	2026-01-15 16:15:00	PENDING	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	2026-01-15 10:52:50.965908	2026-01-15 10:52:50.965908
2	1	2	1	1	2026-01-15 17:00:00	2026-01-15 17:30:00	CONFIRMED	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	4	2026-01-15 10:58:40.777086	2026-01-15 10:58:40.777086
2	4	2	2	\N	2026-01-24 15:03:00	2026-01-24 15:48:00	PENDING		\N	\N	\N	\N	\N	\N	oLm06HMa6UI	f	f	pending	5	2026-01-15 14:00:25.615783	2026-01-15 14:00:25.615789
2	1	2	2	\N	2026-02-07 13:50:00	2026-02-07 14:35:00	PENDING		\N	\N	\N	\N	\N	\N	gcBzFRUbjaY	f	f	pending	6	2026-01-15 15:43:17.78111	2026-01-15 15:43:17.781117
2	1	4	2	\N	2026-01-16 12:30:00	2026-01-16 13:15:00	PENDING		\N	\N	\N	\N	\N	\N	In01-RALmUo	f	f	pending	7	2026-01-16 11:28:01.722279	2026-01-16 11:28:01.722287
2	1	2	1	\N	2026-01-17 22:34:00	2026-01-17 23:04:00	PENDING		\N	\N	\N	\N	\N	\N	toVH2-afnYY	f	f	pending	8	2026-01-16 22:32:02.179364	2026-01-16 22:32:02.179372
2	\N	3	5	\N	2026-01-20 15:23:00	2026-01-20 16:23:00	PENDING		\N	\N	\N	\N	\N	\N	wzGsBO77vWI	f	f	pending	9	2026-01-20 14:24:36.079967	2026-01-20 14:24:36.079974
2	1	4	2	\N	2026-01-26 14:07:00	2026-01-26 14:52:00	PENDING		\N	\N	\N	\N	\N	\N	nmmPZekqpR8	f	f	pending	10	2026-01-24 13:03:46.498637	2026-01-24 13:03:46.498644
2	1	4	2	\N	2026-01-26 17:18:00	2026-01-26 18:03:00	PENDING		\N	\N	\N	\N	\N	\N	N0EoWXbQWB0	f	f	pending	11	2026-01-26 12:00:14.5022	2026-01-26 12:00:36.292797
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.brands (company_id, name, notes, id, created_at, updated_at) FROM stdin;
2	Wellla 	asdsadsadasdad	1	2026-01-15 11:11:27.225301	2026-01-15 11:11:27.225306
\.


--
-- Data for Name: cash_registers; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.cash_registers (company_id, user_id, opening_date, opening_balance, closing_date, closing_balance, payment_summary, is_open, id, created_at, updated_at) FROM stdin;
2	1	2026-01-15 08:41:36.08565	300.00	2026-01-16 22:34:06.630386	300.00	{}	f	1	2026-01-15 14:41:36.08565	2026-01-16 22:34:06.636908
\.


--
-- Data for Name: cashback_balances; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.cashback_balances (company_id, client_crm_id, balance, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cashback_rules; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.cashback_rules (company_id, name, description, rule_type, value, applies_to_products, applies_to_services, specific_items, client_filters, valid_from, valid_until, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cashback_transactions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.cashback_transactions (company_id, balance_id, rule_id, command_id, value, transaction_type, description, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.clients (company_id, user_id, full_name, nickname, email, phone, cellphone, date_of_birth, cpf, cnpj, address, address_number, address_complement, neighborhood, city, state, zip_code, credits, marketing_whatsapp, marketing_email, is_active, notes, id, created_at, updated_at) FROM stdin;
2	\N	Maria Silva	\N	maria.silva@email.com	11977777777	\N	\N	12345678909	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	1	2026-01-15 10:52:34.105216	2026-01-15 10:52:34.105216
2	\N	João Santos	\N	joao.santos@email.com	11966666666	\N	\N	98765432100	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	2	2026-01-15 10:52:34.105216	2026-01-15 10:52:34.105216
2	\N	Ana Oliveira	\N	ana.oliveira@email.com	11955555555	\N	\N	11122233344	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	3	2026-01-15 10:52:34.105216	2026-01-15 10:52:34.105216
2	\N	Ana Maria Magalhaes freitas	aninha	andrekaidellisola@gmail.com	11968029600		2026-01-15	12334545423	\N	R. Padre Jacinto Nunes	22	\N	Cangaiba - PENHA	São Paulo	SP	03720-020	0.00	f	f	t	\N	4	2026-01-15 11:04:23.139027	2026-01-15 11:04:23.139036
\.


--
-- Data for Name: command_items; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.command_items (command_id, item_type, reference_id, service_id, product_id, package_id, professional_id, quantity, unit_value, total_value, commission_percentage, id, created_at, updated_at) FROM stdin;
3	PRODUCT	1	\N	1	\N	\N	1	100.00	100.00	0	1	2026-01-15 20:37:26.855335	2026-01-15 20:37:26.855343
4	SERVICE	4	4	\N	\N	3	1	120.00	120.00	0	2	2026-01-15 21:20:01.194111	2026-01-15 21:20:01.194117
4	SERVICE	5	5	\N	\N	2	1	200.00	200.00	0	3	2026-01-15 21:20:01.19412	2026-01-15 21:20:01.194123
5	SERVICE	2	2	\N	\N	4	1	250.00	250.00	0	4	2026-01-15 21:34:02.276202	2026-01-15 21:34:02.276208
6	SERVICE	2	2	\N	\N	4	1	250.00	250.00	0	5	2026-01-16 22:32:25.019931	2026-01-16 22:32:25.019938
7	SERVICE	2	2	\N	\N	3	1	250.00	250.00	10	6	2026-01-20 14:16:24.776973	2026-01-20 14:16:24.776977
\.


--
-- Data for Name: commands; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.commands (company_id, client_crm_id, professional_id, appointment_id, number, date, status, total_value, discount_value, net_value, payment_summary, payment_blocked, payment_received, has_nfse, has_nfe, has_nfce, notes, id, created_at, updated_at) FROM stdin;
2	1	4	\N	CMD-20260115-0001	2026-01-15 23:37:00	OPEN	100.00	0.00	100.00	\N	f	f	f	f	f	teste	3	2026-01-15 20:37:26.807404	2026-01-15 20:37:26.84055
2	1	3	\N	CMD-20260115-0002	2026-01-16 00:19:00	OPEN	320.00	0.00	320.00	\N	f	f	f	f	f		4	2026-01-15 21:20:01.117787	2026-01-15 21:20:01.182746
2	2	4	\N	CMD-20260115-0003	2026-01-16 00:33:00	OPEN	250.00	0.00	250.00	\N	f	f	f	f	f		5	2026-01-15 21:34:02.260972	2026-01-15 21:34:02.273552
2	1	2	\N	CMD-20260116-0001	2026-01-17 01:32:00	OPEN	250.00	0.00	250.00	\N	f	f	f	f	f		6	2026-01-16 22:32:24.987638	2026-01-16 22:32:25.011506
2	1	2	\N	CMD-20260120-0001	2026-01-21 20:18:00	OPEN	250.00	0.00	250.00	\N	f	f	f	f	f		7	2026-01-20 14:16:24.737809	2026-01-20 14:16:24.77241
\.


--
-- Data for Name: commission_configs; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.commission_configs (company_id, date_filter_type, command_type_filter, fees_responsibility, discounts_responsibility, deduct_additional_service_cost, product_discount_origin, discount_products_from, id, created_at, updated_at) FROM stdin;
2	competence	finished	proportional	proportional	f	professional_commission	\N	1	2026-01-15 14:01:29.254974	2026-01-15 14:01:29.254981
\.


--
-- Data for Name: commissions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.commissions (company_id, command_id, command_item_id, professional_id, base_value, commission_percentage, commission_value, status, paid_at, payment_notes, financial_transaction_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.companies (name, slug, description, email, phone, website, address, address_number, address_complement, neighborhood, city, state, country, postal_code, company_type, cpf, cnpj, trade_name, municipal_registration, state_registration, whatsapp, business_hours, timezone, currency, business_type, team_size, logo_url, primary_color, secondary_color, is_active, subscription_plan, subscription_expires_at, features, settings, online_booking_enabled, online_booking_url, online_booking_description, online_booking_gallery, online_booking_social_media, id, created_at, updated_at, subscription_plan_id) FROM stdin;
Clínica Saúde Teste	clinica-saude-teste	\N	contato@clinicasaudeteste.com.br	11999999999	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	12345678901234	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	2026-01-15 10:50:56.080032	2026-01-15 10:50:56.080032	4
\.


--
-- Data for Name: company_add_ons; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_add_ons (id, created_at, updated_at, company_id, addon_id, is_active, activated_at, deactivated_at, next_billing_date, auto_renew, source, trial_end_date, is_trial) FROM stdin;
\.


--
-- Data for Name: company_admin_settings; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_admin_settings (id, company_id, default_message_language, currency, country, timezone, date_format, time_format, additional_settings, created_at, updated_at) FROM stdin;
1	2	pt_BR	BRL	BR	America/Sao_Paulo	DD/MM/YYYY	HH:mm	\N	2026-01-15 11:05:46.486831	2026-01-15 11:05:46.486836
\.


--
-- Data for Name: company_details; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_details (id, company_id, company_type, document_number, company_name, municipal_registration, state_registration, email, phone, whatsapp, postal_code, address, address_number, address_complement, neighborhood, city, state, country, created_at, updated_at) FROM stdin;
1	2	pessoa_fisica	483.736.638-43	ANdryll SOlutions	teste	teste	contato@empresa.com	1112344556	\N	03720-020	padre jacinto nunes 	32	nA	vila paulistania	sao paulo	SP	\N	2026-01-15 11:05:46.489715	2026-01-16 11:27:35.250974
\.


--
-- Data for Name: company_financial_settings; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_financial_settings (id, company_id, allow_retroactive_entries, allow_invoice_edit_after_conference, edit_only_value_after_conference, allow_operations_with_closed_cash, require_category_on_transaction, require_payment_form_on_transaction, created_at, updated_at) FROM stdin;
1	2	f	f	t	f	t	t	2026-01-15 11:05:46.49235	2026-01-15 11:05:46.492355
\.


--
-- Data for Name: company_notification_settings; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_notification_settings (id, company_id, notify_new_appointment, notify_appointment_cancellation, notify_appointment_deletion, notify_new_review, notify_sms_response, notify_client_return, notify_goal_achievement, notify_client_waiting, notification_sound_enabled, notification_duration_seconds, created_at, updated_at) FROM stdin;
1	2	t	t	t	t	f	t	t	t	t	5	2026-01-15 11:05:46.494714	2026-01-15 11:05:46.494719
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_settings (company_id, email_config, sms_config, whatsapp_config, vapid_config, general_settings, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: company_subscriptions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_subscriptions (company_id, plan_type, trial_end_date, coupon_code, referral_code, id, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Data for Name: company_theme_settings; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_theme_settings (id, company_id, interface_language, sidebar_color, theme_mode, custom_logo_url, created_at, updated_at) FROM stdin;
65799	2	es	#4dff00	light	https://cdn-icons-png.flaticon.com/512/3214/3214679.png	2026-01-15 10:54:02.697599	2026-01-27 17:58:30.51992
\.


--
-- Data for Name: company_users; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.company_users (company_id, user_id, role, is_active, invited_by_id, invited_at, joined_at, last_active_at, notes, id, created_at, updated_at) FROM stdin;
2	5	COMPANY_OWNER	active	\N	2026-01-25 00:48:00.616027	2026-01-25 00:48:00.616034	\N	\N	1	2026-01-25 00:48:00.620849	2026-01-25 00:48:00.620856
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.document_templates (company_id, name, description, document_type, template_content, variables, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: evaluations; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.evaluations (company_id, client_id, professional_id, appointment_id, rating, comment, origin, is_answered, answer_date, answer_text, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_accounts; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.financial_accounts (company_id, name, description, account_type, balance, is_active, admin_only, id, created_at, updated_at) FROM stdin;
2	teste	tewste 	cash	0.00	t	f	1	2026-01-15 14:03:44.141484	2026-01-15 14:03:44.141489
2	Caixa	\N	cash	1000.00	t	f	2	2026-01-15 14:04:32.395769	2026-01-15 14:04:32.395769
2	Banco	\N	bank	5000.00	t	f	3	2026-01-15 14:04:32.395769	2026-01-15 14:04:32.395769
\.


--
-- Data for Name: financial_categories; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.financial_categories (company_id, parent_id, name, type, description, id, created_at, updated_at) FROM stdin;
2	\N	Receitas	income	Categoria de receitas	1	2026-01-15 14:03:06.209546	2026-01-15 14:03:06.209546
2	\N	Despesas	expense	Categoria de despesas	2	2026-01-15 14:03:06.209546	2026-01-15 14:03:06.209546
2	\N	Serviços	income	Categoria de serviços	3	2026-01-15 14:03:06.209546	2026-01-15 14:03:06.209546
2	\N	testeeess	income	teste	4	2026-01-15 14:03:55.955348	2026-01-15 14:03:55.955353
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.financial_transactions (company_id, account_id, category_id, client_id, origin, command_id, purchase_id, subscription_sale_id, payment_id, invoice_id, professional_id, type, value, net_value, fee_percentage, fee_value, date, description, payment_method, status, is_paid, id, created_at, updated_at) FROM stdin;
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	48.00	48.00	0.00	0.00	2026-01-14 15:00:00	Seed expense	cash	liquidated	t	17	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	56.00	56.00	0.00	0.00	2026-01-13 15:00:00	Seed expense	cash	liquidated	t	18	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	64.00	64.00	0.00	0.00	2026-01-12 15:00:00	Seed expense	cash	liquidated	t	19	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	72.00	72.00	0.00	0.00	2026-01-11 15:00:00	Seed expense	cash	liquidated	t	20	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	80.00	80.00	0.00	0.00	2026-01-10 15:00:00	Seed expense	cash	liquidated	t	21	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	88.00	88.00	0.00	0.00	2026-01-09 15:00:00	Seed expense	cash	liquidated	t	22	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	96.00	96.00	0.00	0.00	2026-01-08 15:00:00	Seed expense	cash	liquidated	t	23	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	104.00	104.00	0.00	0.00	2026-01-07 15:00:00	Seed expense	cash	liquidated	t	24	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	112.00	112.00	0.00	0.00	2026-01-06 15:00:00	Seed expense	cash	liquidated	t	25	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	120.00	120.00	0.00	0.00	2026-01-05 15:00:00	Seed expense	cash	liquidated	t	26	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	128.00	128.00	0.00	0.00	2026-01-04 15:00:00	Seed expense	cash	liquidated	t	27	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	180.00	180.00	0.00	0.00	2026-01-15 14:41:36.08565	Seed planned expense	cash	planned	f	29	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	1	manual	\N	\N	\N	\N	\N	2	income	330.00	330.00	0.00	0.00	2026-01-01 10:00:00	Seed income	pix	liquidated	t	15	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	2	manual	\N	\N	\N	\N	\N	2	income	315.00	315.00	0.00	0.00	2026-01-02 10:00:00	Seed income	pix	liquidated	t	14	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	3	manual	\N	\N	\N	\N	\N	2	income	300.00	300.00	0.00	0.00	2026-01-03 10:00:00	Seed income	pix	liquidated	t	13	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	4	manual	\N	\N	\N	\N	\N	2	income	285.00	285.00	0.00	0.00	2026-01-04 10:00:00	Seed income	pix	liquidated	t	12	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	1	manual	\N	\N	\N	\N	\N	2	income	270.00	270.00	0.00	0.00	2026-01-05 10:00:00	Seed income	pix	liquidated	t	11	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	2	manual	\N	\N	\N	\N	\N	2	income	255.00	255.00	0.00	0.00	2026-01-06 10:00:00	Seed income	pix	liquidated	t	10	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	3	manual	\N	\N	\N	\N	\N	2	income	240.00	240.00	0.00	0.00	2026-01-07 10:00:00	Seed income	pix	liquidated	t	9	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	4	manual	\N	\N	\N	\N	\N	2	income	225.00	225.00	0.00	0.00	2026-01-08 10:00:00	Seed income	pix	liquidated	t	8	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	1	manual	\N	\N	\N	\N	\N	2	income	210.00	210.00	0.00	0.00	2026-01-09 10:00:00	Seed income	pix	liquidated	t	7	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	2	manual	\N	\N	\N	\N	\N	2	income	195.00	195.00	0.00	0.00	2026-01-10 10:00:00	Seed income	pix	liquidated	t	6	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	3	manual	\N	\N	\N	\N	\N	2	income	180.00	180.00	0.00	0.00	2026-01-11 10:00:00	Seed income	pix	liquidated	t	5	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	4	manual	\N	\N	\N	\N	\N	2	income	165.00	165.00	0.00	0.00	2026-01-12 10:00:00	Seed income	pix	liquidated	t	4	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	1	manual	\N	\N	\N	\N	\N	2	income	150.00	150.00	0.00	0.00	2026-01-13 10:00:00	Seed income	pix	liquidated	t	3	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	2	manual	\N	\N	\N	\N	\N	2	income	135.00	135.00	0.00	0.00	2026-01-14 10:00:00	Seed income	pix	liquidated	t	2	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	2	1	3	manual	\N	\N	\N	\N	\N	2	income	120.00	120.00	0.00	0.00	2026-01-15 10:00:00	Seed income	pix	liquidated	t	1	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	3	2	\N	manual	\N	\N	\N	\N	\N	\N	expense	40.00	40.00	0.00	0.00	2026-01-15 15:00:00	Seed expense	cash	liquidated	f	16	2026-01-15 14:41:36.08565	2026-01-15 17:07:08.025329
2	2	1	1	manual	\N	\N	\N	\N	\N	2	income	250.00	250.00	0.00	0.00	2026-01-15 14:41:36.08565	Seed planned income	pix	liquidated	f	28	2026-01-15 14:41:36.08565	2026-01-15 21:15:40.41423
2	\N	\N	\N	manual	\N	\N	\N	\N	\N	\N	income	54454.00	\N	0.00	0.00	2026-01-15 23:11:00	Venda de pacote teste de pacote	\N	liquidated	f	30	2026-01-15 20:11:28.766513	2026-01-25 13:28:29.96953
\.


--
-- Data for Name: fiscal_configurations; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.fiscal_configurations (company_id, nfse_provider, nfe_provider, nfce_provider, provider_api_key, provider_api_secret, environment, auto_generate_nfse, auto_generate_nfe, auto_generate_nfce, settings, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: generated_documents; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.generated_documents (company_id, template_id, client_crm_id, command_id, title, content, file_url, variables_used, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.goals (company_id, professional_id, type, target_value, period_start, period_end, description, is_active, current_value, progress_percentage, id, created_at, updated_at) FROM stdin;
2	4	SERVICES	900.00	2026-01-15 03:00:00	2026-02-03 02:59:59	\N	t	0.00	0	1	2026-01-15 20:49:01.535332	2026-01-15 20:58:34.030315
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.invoices (company_id, command_id, client_crm_id, invoice_type, number, access_key, provider, provider_invoice_id, status, total_value, issue_date, sent_date, xml_url, pdf_url, error_message, provider_response, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_queue; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.notification_queue (company_id, user_id, trigger_id, template_id, channel, title, body, url, icon, scheduled_at, max_retries, retry_count, status, sent_at, error_message, event_type, reference_id, reference_type, context_data, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.notification_templates (company_id, created_by, name, description, event_type, channel, title_template, body_template, url_template, icon_url, is_active, is_default, available_placeholders, id, created_at, updated_at) FROM stdin;
2	1	confirmacao de agendamento	teste	APPOINTMENT_CREATED	PUSH	teste	teste	\N	\N	t	f	\N	1	2026-01-15 20:39:56.332633	2026-01-15 20:39:56.33264
\.


--
-- Data for Name: notification_triggers; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.notification_triggers (company_id, template_id, created_by, name, event_type, trigger_condition, trigger_offset_minutes, trigger_time, trigger_day_of_week, trigger_day_of_month, filters, target_roles, send_to_client, send_to_professional, send_to_manager, is_active, last_triggered_at, trigger_count, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.notifications (user_id, notification_type, status, title, message, data, recipient, sent_at, read_at, error_message, retry_count, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: online_booking_business_hours; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.online_booking_business_hours (id, created_at, updated_at, company_id, config_id, day_of_week, is_active, start_time, break_start_time, break_end_time, end_time) FROM stdin;
\.


--
-- Data for Name: online_booking_configs; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.online_booking_configs (id, created_at, updated_at, company_id, public_name, public_description, logo_url, use_company_address, public_address, public_address_number, public_address_complement, public_neighborhood, public_city, public_state, public_postal_code, public_whatsapp, public_phone, public_instagram, public_facebook, public_website, primary_color, theme, booking_flow, require_login, min_advance_time_minutes, allow_cancellation, cancellation_min_hours, enable_payment_local, enable_payment_card, enable_payment_pix, enable_deposit_payment, deposit_percentage, is_active, settings) FROM stdin;
\.


--
-- Data for Name: online_booking_gallery; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.online_booking_gallery (id, created_at, updated_at, company_id, config_id, image_url, display_order, is_active) FROM stdin;
\.


--
-- Data for Name: package_plans; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.package_plans (company_id, name, description, price, currency, sessions_included, validity_days, service_ids, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: packages; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.packages (company_id, client_crm_id, predefined_package_id, sale_date, expiry_date, status, sessions_balance, paid_value, invoice_id, id, created_at, updated_at) FROM stdin;
2	1	3	2026-01-15 23:11:00	2026-02-14 23:11:00	ACTIVE	{"2": 1}	54454.00	\N	1	2026-01-15 20:11:28.790026	2026-01-15 20:11:28.790033
\.


--
-- Data for Name: payment_forms; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.payment_forms (company_id, name, type, integrates_with_gateway, gateway_name, id, created_at, updated_at) FROM stdin;
2	teste	cash	f	\N	1	2026-01-15 14:03:48.461925	2026-01-15 14:03:48.46193
2	Dinheiro	cash	f	\N	2	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	Cartao	card	f	\N	3	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	Pix	pix	f	\N	4	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
2	Boleto	boleto	f	\N	5	2026-01-15 14:41:36.08565	2026-01-15 14:41:36.08565
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.payments (company_id, appointment_id, user_id, amount, currency, payment_method, status, gateway, gateway_transaction_id, gateway_response, pix_code, pix_qr_code, boleto_url, boleto_barcode, paid_at, refunded_at, commission_amount, commission_paid, notes, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.plans (id, created_at, updated_at, name, slug, description, price_monthly, price_yearly, currency, max_professionals, max_units, max_clients, max_appointments_per_month, features, highlight_label, display_order, color, is_active, is_visible, trial_days, price_min, price_max) FROM stdin;
1	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Essencial	essencial	Indicado para profissional solo ou negócios iniciantes	89.00	\N	BRL	2	1	-1	-1	["clients", "services", "products", "appointments", "commands", "financial_basic", "reports_basic"]	\N	1	#3B82F6	t	t	14	\N	\N
2	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Pro	pro	Indicado para salões e clínicas estruturadas	149.00	\N	BRL	5	1	-1	-1	["clients", "services", "products", "appointments", "commands", "financial_complete", "reports_complete", "packages", "commissions", "goals", "anamneses", "purchases", "evaluations", "whatsapp_marketing"]	Mais Popular	2	#3B82F6	t	t	14	\N	\N
3	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Premium	premium	Indicado para negócios em crescimento	249.00	\N	BRL	10	2	-1	-1	["clients", "services", "products", "appointments", "commands", "financial_complete", "reports_complete", "packages", "commissions", "goals", "anamneses", "purchases", "evaluations", "whatsapp_marketing", "cashback", "promotions", "subscription_sales", "document_generator", "invoices", "online_booking", "pricing_intelligence", "advanced_reports", "professional_ranking", "client_funnel"]	Recomendado	3	#3B82F6	t	t	14	\N	\N
4	2026-01-14 22:44:24.801485	2026-01-14 22:44:24.801485	Scale	scale	Indicado para redes, clínicas premium e negócios escaláveis	399.00	\N	BRL	-1	-1	-1	-1	["clients", "services", "products", "appointments", "commands", "financial_complete", "reports_complete", "packages", "commissions", "goals", "anamneses", "purchases", "evaluations", "whatsapp_marketing", "cashback", "promotions", "subscription_sales", "document_generator", "invoices", "online_booking", "pricing_intelligence", "advanced_reports", "professional_ranking", "client_funnel", "crm_advanced", "multi_unit_reports", "automatic_campaigns", "priority_support", "programa_crescer"]	Enterprise	4	#3B82F6	t	t	14	399.00	499.00
\.


--
-- Data for Name: predefined_packages; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.predefined_packages (company_id, name, description, services_included, validity_days, total_value, is_active, id, created_at, updated_at) FROM stdin;
2	Pacote Básico	3 consultas clínicas gerais com 10% de desconto	[{"service_id": 1, "quantity": 3}]	90	405.00	t	1	2026-01-15 13:25:02.211214	2026-01-15 13:25:02.211214
2	Pacote Premium	5 consultas especializadas com 15% de desconto	[{"service_id": 2, "quantity": 5}]	180	1062.50	t	2	2026-01-15 13:25:40.969874	2026-01-15 13:25:40.969874
2	teste de pacote	teste de pacote	[{"service_id": 2, "sessions": 1}]	30	199.99	t	3	2026-01-15 13:26:38.568306	2026-01-15 13:26:38.568313
2	CLUB ESCOVA 	bnfgn gmgcm gcd mt dcx mdcnmdc m	[{"service_id": 2, "sessions": 1}]	30	100.00	t	4	2026-01-15 21:56:55.499406	2026-01-16 19:12:44.831268
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.product_categories (company_id, name, description, is_active, id, created_at, updated_at) FROM stdin;
2	Condiciionador	sadsadasd	t	1	2026-01-15 11:11:19.146404	2026-01-15 11:11:19.146409
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.products (company_id, brand_id, category_id, name, description, stock_current, stock_minimum, unit, cost_price, sale_price, commission_percentage, barcode, images, image_url, is_active, id, created_at, updated_at) FROM stdin;
2	\N	\N	Teste	\N	10	0	UN	0.00	100.00	0	\N	\N	\N	t	1	2026-01-15 13:42:43.469298	2026-01-15 13:42:43.469306
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.promotions (company_id, name, description, type, discount_value, applies_to_services, applies_to_products, applies_to_clients, valid_from, valid_until, max_uses, max_uses_per_client, current_uses, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchase_items; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.purchase_items (purchase_id, product_id, quantity, unit_cost, total_cost, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.purchases (company_id, supplier_id, number, purchase_date, total_value, status, payment_method, notes, xml_imported, xml_url, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: push_notification_logs; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.push_notification_logs (company_id, user_id, subscription_id, title, body, url, icon, badge, image, tag, notification_type, reference_id, reference_type, status, error_message, response_status, response_body, sent_at, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.resources (company_id, name, description, resource_type, is_active, is_available, location, capacity, image_url, id, created_at, updated_at) FROM stdin;
2	Sala 1	Sala de consulta clínica geral	ROOM	t	\N	\N	\N	\N	1	2026-01-15 10:52:22.509036	2026-01-15 10:52:22.509036
2	Sala 2	Sala de procedimentos	ROOM	t	\N	\N	\N	\N	2	2026-01-15 10:52:22.509036	2026-01-15 10:52:22.509036
2	Laboratório	Sala de exames laboratoriais	EQUIPMENT	t	\N	\N	\N	\N	3	2026-01-15 10:52:22.509036	2026-01-15 10:52:22.509036
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.reviews (company_id, appointment_id, client_crm_id, professional_id, rating, comment, origin, is_visible, is_approved, response, response_at, is_answered, answer_date, answer_text, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.service_categories (company_id, name, description, icon, color, is_active, id, created_at, updated_at) FROM stdin;
2	Consulta	Consultas médicas e especializadas	\N	\N	t	1	2026-01-15 10:51:26.138874	2026-01-15 10:51:26.138874
2	Exame	Exames laboratoriais e de imagem	\N	\N	t	2	2026-01-15 10:51:26.138874	2026-01-15 10:51:26.138874
2	Procedimento	Procedimentos médicos e estéticos	\N	\N	t	3	2026-01-15 10:51:26.138874	2026-01-15 10:51:26.138874
\.


--
-- Data for Name: service_professionals; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.service_professionals (service_id, professional_id, is_active, assigned_at, removed_at, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.services (company_id, category_id, name, description, price, currency, duration_minutes, is_active, requires_professional, image_url, color, commission_rate, id, created_at, updated_at, available_online, online_booking_enabled, extra_cost, lead_time_minutes, is_favorite) FROM stdin;
2	1	Consulta Clínica Geral	Consulta médica geral	150.00	BRL	30	t	f	\N	\N	\N	1	2026-01-15 10:51:46.098425	2026-01-15 10:51:46.098425	\N	\N	\N	0	f
2	1	Consulta Cardiologia	Consulta com cardiologista	250.00	BRL	45	t	f	\N	\N	\N	2	2026-01-15 10:51:46.098425	2026-01-15 10:51:46.098425	\N	\N	\N	0	f
2	2	Exame de Sangue	Coleta de exames laboratoriais	80.00	BRL	15	t	f	\N	\N	\N	3	2026-01-15 10:51:46.098425	2026-01-15 10:51:46.098425	\N	\N	\N	0	f
2	2	Eletrocardiograma	Exame de ECG	120.00	BRL	20	t	f	\N	\N	\N	4	2026-01-15 10:51:46.098425	2026-01-15 10:51:46.098425	\N	\N	\N	0	f
2	3	Limpeza de Pele	Procedimento estético	200.00	BRL	60	t	f	\N	\N	\N	5	2026-01-15 10:51:46.098425	2026-01-15 10:51:46.098425	\N	\N	\N	0	f
\.


--
-- Data for Name: standalone_services; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.standalone_services (name, slug, description, price, price_min, price_max, currency, service_type, duration_days, includes, is_active, is_visible, display_order, included_in_plans, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscription_sale_models; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.subscription_sale_models (company_id, name, description, monthly_value, services_included, credits_included, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscription_sales; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.subscription_sales (company_id, client_crm_id, model_id, start_date, end_date, status, current_month_credits_used, current_month_services_used, last_payment_date, next_payment_date, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.subscriptions (company_id, user_id, plan_id, is_active, sessions_remaining, sessions_used, start_date, end_date, payment_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.suppliers (company_id, name, email, phone, cellphone, cpf, cnpj, address, address_number, address_complement, neighborhood, city, state, zip_code, notes, id, created_at, updated_at) FROM stdin;
2	AUGUSTO MAIRNHO FRREIRA	andrekaidellisola@gmail.com	11968029600	11111111111111111111	\N	000000000000000000	SERGIO TOMAS 235	\N	\N	\N	São Paulo	sp	03720-020		1	2026-01-15 11:05:35.72588	2026-01-15 11:05:35.725885
\.


--
-- Data for Name: user_push_subscriptions; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.user_push_subscriptions (user_id, company_id, endpoint, p256dh, auth, browser, device_name, user_agent, is_active, last_used_at, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.users (company_id, email, password_hash, full_name, phone, saas_role, role, is_active, is_verified, avatar_url, bio, date_of_birth, gender, address, city, state, postal_code, specialties, working_hours, commission_rate, oauth_provider, oauth_id, notification_preferences, notes, tags, id, created_at, updated_at, cpf_cnpj) FROM stdin;
2	rony.xp@hotmail.com	$argon2id$v=19$m=65536,t=3,p=4$vreWEkJIiTGGkDKm1HqvVQ$hr+REg9fIeXMeju8GfJOB9ng/wneaQ2Tie7vzcmXGdQ	Roni Silva	45999709275	\N	PROFESSIONAL	t	f			1998-06-09	male					[]	{"monday": {"enabled": true, "start": "09:00", "end": "18:00"}, "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"}, "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"}, "thursday": {"enabled": true, "start": "09:00", "end": "18:00"}, "friday": {"enabled": true, "start": "09:00", "end": "18:00"}, "saturday": {"enabled": false, "start": "09:00", "end": "18:00"}, "sunday": {"enabled": false, "start": "09:00", "end": "18:00"}}	0	\N	\N	null	\N	\N	3	2026-01-15 15:44:45.063581	2026-01-26 12:16:01.767269	
2	andrekaique1998@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$tPY+p1QK4XwPYSwlRAhhTA$V73XVTHjUTq1B6qmP4ZOUPNM0EqM3c0tLNxXWylAW9Q	ANDRE KAIQUE DELL ISOLA	11968029600	\N	PROFESSIONAL	t	f			2003-06-11	male	R. Padre Jacinto Nunes, 22	São Paulo	SP	03720-020	[]	{"monday": {"enabled": true, "start": "09:00", "end": "18:00"}, "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"}, "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"}, "thursday": {"enabled": true, "start": "09:00", "end": "18:00"}, "friday": {"enabled": true, "start": "09:00", "end": "18:00"}, "saturday": {"enabled": false, "start": "09:00", "end": "18:00"}, "sunday": {"enabled": false, "start": "09:00", "end": "18:00"}}	0	\N	\N	null	\N	\N	4	2026-01-15 18:43:04.395532	2026-01-15 18:43:52.987488	\N
2	andrekaidellisola@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$PKcU4nyvNSbE+J/zPkcopQ$ZH58lvZLylXx7iikLK23xWs+GC8jjU9SunVPK7Nwi0U	Andre Kaidellisola	\N	admin	ADMIN	t	t	/uploads/me_1_12d9833f-37eb-4f18-be7a-cc9de32a2a84.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-01-14 23:56:13.807885	2026-01-27 01:57:50.026277	\N
2	dr.joao@clinicasaudeteste.com.br	$argon2id$v=19$m=65536,t=3,p=4$KEVIqRXC+F+LkfL+f48xxg$hoZJ6Ax6IqcXxt1RFFONSyk7j/xCRfbMxCiNSWE4v4s	Dr. João Silva	11988888888	\N	PROFESSIONAL	t	t	/uploads/prof_2_4e57eabb-452c-40eb-b930-22c8d484c962.jpg								[]	{"monday": {"enabled": true, "start": "09:00", "end": "18:00"}, "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"}, "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"}, "thursday": {"enabled": true, "start": "09:00", "end": "18:00"}, "friday": {"enabled": true, "start": "09:00", "end": "18:00"}, "saturday": {"enabled": false, "start": "09:00", "end": "18:00"}, "sunday": {"enabled": false, "start": "09:00", "end": "18:00"}}	\N	\N	\N	\N	\N	\N	2	2026-01-15 10:51:23.063268	2026-01-24 21:22:25.467336	
\N	admin@Expectropatrono.com.br	$argon2id$v=19$m=65536,t=3,p=4$NYZwDmHsHaM0hvAewxgj5A$JjKRkfe02WHhdpEsPCB8wI3GxhVbgb3JEm3iwCVkACU	Super Admin SaaS	\N	SAAS_OWNER	SAAS_ADMIN	t	t	/uploads/me_5_b241ba31-0698-41cc-a6e6-92f9efdce627.jpg	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	5	2026-01-24 21:28:55.001108	2026-01-25 01:22:23.232406	\N
\.


--
-- Data for Name: waitlist; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.waitlist (company_id, client_id, client_crm_id, service_id, professional_id, preferred_date_start, preferred_date_end, status, priority, notified_at, expires_at, notes, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_automated_campaigns; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.whatsapp_automated_campaigns (id, company_id, campaign_type, is_enabled, config, message_template, filters, send_time_start, send_time_end, send_weekdays_only, total_triggered, total_sent, total_failed, created_at, updated_at, is_configured) FROM stdin;
\.


--
-- Data for Name: whatsapp_campaign_logs; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.whatsapp_campaign_logs (company_id, campaign_id, client_crm_id, phone_number, message_content, status, sent_at, delivered_at, read_at, error_message, provider_response, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_campaign_triggers; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.whatsapp_campaign_triggers (id, company_id, automated_campaign_id, event_type, event_data, client_id, phone_number, is_processed, is_sent, scheduled_for, campaign_log_id, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_campaigns; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.whatsapp_campaigns (company_id, template_id, name, description, campaign_type, content, auto_send_enabled, schedule_config, client_filters, status, total_sent, total_delivered, total_read, total_failed, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_providers; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.whatsapp_providers (company_id, provider_name, api_url, api_key, api_secret, instance_id, is_active, is_connected, settings, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: whatsapp_templates; Type: TABLE DATA; Schema: public; Owner: agendamento_app
--

COPY public.whatsapp_templates (company_id, name, content, available_variables, is_active, id, created_at, updated_at) FROM stdin;
\.


--
-- Name: add_ons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.add_ons_id_seq', 9, true);


--
-- Name: anamneses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.anamneses_id_seq', 1, false);


--
-- Name: anamnesis_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.anamnesis_models_id_seq', 1, false);


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 1, false);


--
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.appointments_id_seq', 11, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.brands_id_seq', 1, true);


--
-- Name: cash_registers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.cash_registers_id_seq', 1, true);


--
-- Name: cashback_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.cashback_balances_id_seq', 1, false);


--
-- Name: cashback_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.cashback_rules_id_seq', 1, false);


--
-- Name: cashback_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.cashback_transactions_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.clients_id_seq', 4, true);


--
-- Name: command_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.command_items_id_seq', 6, true);


--
-- Name: commands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.commands_id_seq', 7, true);


--
-- Name: commission_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.commission_configs_id_seq', 1, true);


--
-- Name: commissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.commissions_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.companies_id_seq', 2, true);


--
-- Name: company_add_ons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_add_ons_id_seq', 1, false);


--
-- Name: company_admin_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_admin_settings_id_seq', 2, true);


--
-- Name: company_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_details_id_seq', 1, true);


--
-- Name: company_financial_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_financial_settings_id_seq', 1, true);


--
-- Name: company_notification_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_notification_settings_id_seq', 1, true);


--
-- Name: company_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_settings_id_seq', 1, true);


--
-- Name: company_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_subscriptions_id_seq', 1, false);


--
-- Name: company_theme_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_theme_settings_id_seq', 65833, true);


--
-- Name: company_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.company_users_id_seq', 1, true);


--
-- Name: document_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.document_templates_id_seq', 1, false);


--
-- Name: evaluations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.evaluations_id_seq', 1, false);


--
-- Name: financial_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.financial_accounts_id_seq', 3, true);


--
-- Name: financial_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.financial_categories_id_seq', 4, true);


--
-- Name: financial_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.financial_transactions_id_seq', 30, true);


--
-- Name: fiscal_configurations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.fiscal_configurations_id_seq', 1, false);


--
-- Name: generated_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.generated_documents_id_seq', 1, false);


--
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.goals_id_seq', 1, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: notification_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.notification_queue_id_seq', 1, false);


--
-- Name: notification_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.notification_templates_id_seq', 1, true);


--
-- Name: notification_triggers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.notification_triggers_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: online_booking_business_hours_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.online_booking_business_hours_id_seq', 1, false);


--
-- Name: online_booking_configs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.online_booking_configs_id_seq', 1, false);


--
-- Name: online_booking_gallery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.online_booking_gallery_id_seq', 1, false);


--
-- Name: packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.packages_id_seq', 1, true);


--
-- Name: payment_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.payment_forms_id_seq', 5, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.plans_id_seq', 1, false);


--
-- Name: plans_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.plans_id_seq1', 4, true);


--
-- Name: predefined_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.predefined_packages_id_seq', 4, true);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.products_id_seq', 1, true);


--
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.promotions_id_seq', 1, false);


--
-- Name: purchase_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.purchase_items_id_seq', 1, false);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, false);


--
-- Name: push_notification_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.push_notification_logs_id_seq', 1, false);


--
-- Name: resources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.resources_id_seq', 3, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 3, true);


--
-- Name: service_professionals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.service_professionals_id_seq', 1, false);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.services_id_seq', 5, true);


--
-- Name: standalone_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.standalone_services_id_seq', 1, false);


--
-- Name: subscription_sale_models_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.subscription_sale_models_id_seq', 1, false);


--
-- Name: subscription_sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.subscription_sales_id_seq', 1, false);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, true);


--
-- Name: user_push_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.user_push_subscriptions_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: waitlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.waitlist_id_seq', 1, false);


--
-- Name: whatsapp_automated_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.whatsapp_automated_campaigns_id_seq', 1, false);


--
-- Name: whatsapp_campaign_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.whatsapp_campaign_logs_id_seq', 1, false);


--
-- Name: whatsapp_campaign_triggers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.whatsapp_campaign_triggers_id_seq', 1, false);


--
-- Name: whatsapp_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.whatsapp_campaigns_id_seq', 1, false);


--
-- Name: whatsapp_providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.whatsapp_providers_id_seq', 1, false);


--
-- Name: whatsapp_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: agendamento_app
--

SELECT pg_catalog.setval('public.whatsapp_templates_id_seq', 1, false);


--
-- Name: add_ons add_ons_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.add_ons
    ADD CONSTRAINT add_ons_pkey PRIMARY KEY (id);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: anamneses anamneses_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT anamneses_pkey PRIMARY KEY (id);


--
-- Name: anamnesis_models anamnesis_models_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamnesis_models
    ADD CONSTRAINT anamnesis_models_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_check_in_code_key; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_check_in_code_key UNIQUE (check_in_code);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: cash_registers cash_registers_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_pkey PRIMARY KEY (id);


--
-- Name: cashback_balances cashback_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_balances
    ADD CONSTRAINT cashback_balances_pkey PRIMARY KEY (id);


--
-- Name: cashback_rules cashback_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_rules
    ADD CONSTRAINT cashback_rules_pkey PRIMARY KEY (id);


--
-- Name: cashback_transactions cashback_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: command_items command_items_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items
    ADD CONSTRAINT command_items_pkey PRIMARY KEY (id);


--
-- Name: commands commands_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_pkey PRIMARY KEY (id);


--
-- Name: commission_configs commission_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commission_configs
    ADD CONSTRAINT commission_configs_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_add_ons company_add_ons_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_add_ons
    ADD CONSTRAINT company_add_ons_pkey PRIMARY KEY (id);


--
-- Name: company_admin_settings company_admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_admin_settings
    ADD CONSTRAINT company_admin_settings_pkey PRIMARY KEY (id);


--
-- Name: company_details company_details_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_details
    ADD CONSTRAINT company_details_pkey PRIMARY KEY (id);


--
-- Name: company_financial_settings company_financial_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_financial_settings
    ADD CONSTRAINT company_financial_settings_pkey PRIMARY KEY (id);


--
-- Name: company_notification_settings company_notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_notification_settings
    ADD CONSTRAINT company_notification_settings_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: company_subscriptions company_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_subscriptions
    ADD CONSTRAINT company_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: company_theme_settings company_theme_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_theme_settings
    ADD CONSTRAINT company_theme_settings_pkey PRIMARY KEY (id);


--
-- Name: company_users company_users_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: evaluations evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_pkey PRIMARY KEY (id);


--
-- Name: financial_accounts financial_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_accounts
    ADD CONSTRAINT financial_accounts_pkey PRIMARY KEY (id);


--
-- Name: financial_categories financial_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_categories
    ADD CONSTRAINT financial_categories_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: fiscal_configurations fiscal_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.fiscal_configurations
    ADD CONSTRAINT fiscal_configurations_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: notification_queue notification_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notification_triggers notification_triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_triggers
    ADD CONSTRAINT notification_triggers_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: online_booking_business_hours online_booking_business_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_business_hours
    ADD CONSTRAINT online_booking_business_hours_pkey PRIMARY KEY (id);


--
-- Name: online_booking_configs online_booking_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_configs
    ADD CONSTRAINT online_booking_configs_pkey PRIMARY KEY (id);


--
-- Name: online_booking_gallery online_booking_gallery_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_gallery
    ADD CONSTRAINT online_booking_gallery_pkey PRIMARY KEY (id);


--
-- Name: packages packages_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_pkey PRIMARY KEY (id);


--
-- Name: payment_forms payment_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payment_forms
    ADD CONSTRAINT payment_forms_pkey PRIMARY KEY (id);


--
-- Name: payments payments_gateway_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_gateway_transaction_id_key UNIQUE (gateway_transaction_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: package_plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.package_plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey1; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey1 PRIMARY KEY (id);


--
-- Name: predefined_packages predefined_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.predefined_packages
    ADD CONSTRAINT predefined_packages_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: purchase_items purchase_items_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: push_notification_logs push_notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.push_notification_logs
    ADD CONSTRAINT push_notification_logs_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_appointment_id_key; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_professionals service_professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_professionals
    ADD CONSTRAINT service_professionals_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: standalone_services standalone_services_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.standalone_services
    ADD CONSTRAINT standalone_services_pkey PRIMARY KEY (id);


--
-- Name: subscription_sale_models subscription_sale_models_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sale_models
    ADD CONSTRAINT subscription_sale_models_pkey PRIMARY KEY (id);


--
-- Name: subscription_sales subscription_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sales
    ADD CONSTRAINT subscription_sales_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: company_add_ons uq_company_addon; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_add_ons
    ADD CONSTRAINT uq_company_addon UNIQUE (company_id, addon_id);


--
-- Name: company_users uq_company_users_user_company; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT uq_company_users_user_company UNIQUE (user_id, company_id);


--
-- Name: user_push_subscriptions user_push_subscriptions_endpoint_key; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.user_push_subscriptions
    ADD CONSTRAINT user_push_subscriptions_endpoint_key UNIQUE (endpoint);


--
-- Name: user_push_subscriptions user_push_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.user_push_subscriptions
    ADD CONSTRAINT user_push_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: waitlist waitlist_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_automated_campaigns whatsapp_automated_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_automated_campaigns
    ADD CONSTRAINT whatsapp_automated_campaigns_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT whatsapp_campaign_logs_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_campaign_triggers whatsapp_campaign_triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_triggers
    ADD CONSTRAINT whatsapp_campaign_triggers_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_campaigns whatsapp_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT whatsapp_campaigns_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_providers whatsapp_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_providers
    ADD CONSTRAINT whatsapp_providers_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_templates whatsapp_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_pkey PRIMARY KEY (id);


--
-- Name: ix_add_ons_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_add_ons_id ON public.add_ons USING btree (id);


--
-- Name: ix_add_ons_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_add_ons_is_active ON public.add_ons USING btree (is_active);


--
-- Name: ix_add_ons_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_add_ons_name ON public.add_ons USING btree (name);


--
-- Name: ix_add_ons_slug; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_add_ons_slug ON public.add_ons USING btree (slug);


--
-- Name: ix_anamneses_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamneses_client_crm_id ON public.anamneses USING btree (client_crm_id);


--
-- Name: ix_anamneses_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamneses_company_id ON public.anamneses USING btree (company_id);


--
-- Name: ix_anamneses_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamneses_id ON public.anamneses USING btree (id);


--
-- Name: ix_anamneses_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamneses_status ON public.anamneses USING btree (status);


--
-- Name: ix_anamnesis_models_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamnesis_models_company_id ON public.anamnesis_models USING btree (company_id);


--
-- Name: ix_anamnesis_models_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamnesis_models_id ON public.anamnesis_models USING btree (id);


--
-- Name: ix_anamnesis_models_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_anamnesis_models_name ON public.anamnesis_models USING btree (name);


--
-- Name: ix_api_keys_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_api_keys_company_id ON public.api_keys USING btree (company_id);


--
-- Name: ix_api_keys_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_api_keys_id ON public.api_keys USING btree (id);


--
-- Name: ix_api_keys_key_hash; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_api_keys_key_hash ON public.api_keys USING btree (key_hash);


--
-- Name: ix_api_keys_key_prefix; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_api_keys_key_prefix ON public.api_keys USING btree (key_prefix);


--
-- Name: ix_api_keys_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_api_keys_user_id ON public.api_keys USING btree (user_id);


--
-- Name: ix_appointments_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_client_crm_id ON public.appointments USING btree (client_crm_id);


--
-- Name: ix_appointments_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_company_id ON public.appointments USING btree (company_id);


--
-- Name: ix_appointments_end_time; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_end_time ON public.appointments USING btree (end_time);


--
-- Name: ix_appointments_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_id ON public.appointments USING btree (id);


--
-- Name: ix_appointments_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_professional_id ON public.appointments USING btree (professional_id);


--
-- Name: ix_appointments_start_time; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_start_time ON public.appointments USING btree (start_time);


--
-- Name: ix_appointments_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_appointments_status ON public.appointments USING btree (status);


--
-- Name: ix_brands_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_brands_company_id ON public.brands USING btree (company_id);


--
-- Name: ix_brands_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_brands_id ON public.brands USING btree (id);


--
-- Name: ix_brands_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_brands_name ON public.brands USING btree (name);


--
-- Name: ix_cash_registers_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cash_registers_company_id ON public.cash_registers USING btree (company_id);


--
-- Name: ix_cash_registers_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cash_registers_id ON public.cash_registers USING btree (id);


--
-- Name: ix_cash_registers_is_open; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cash_registers_is_open ON public.cash_registers USING btree (is_open);


--
-- Name: ix_cash_registers_opening_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cash_registers_opening_date ON public.cash_registers USING btree (opening_date);


--
-- Name: ix_cashback_balances_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_cashback_balances_client_crm_id ON public.cashback_balances USING btree (client_crm_id);


--
-- Name: ix_cashback_balances_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_balances_company_id ON public.cashback_balances USING btree (company_id);


--
-- Name: ix_cashback_balances_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_balances_id ON public.cashback_balances USING btree (id);


--
-- Name: ix_cashback_rules_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_rules_company_id ON public.cashback_rules USING btree (company_id);


--
-- Name: ix_cashback_rules_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_rules_id ON public.cashback_rules USING btree (id);


--
-- Name: ix_cashback_rules_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_rules_name ON public.cashback_rules USING btree (name);


--
-- Name: ix_cashback_transactions_balance_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_transactions_balance_id ON public.cashback_transactions USING btree (balance_id);


--
-- Name: ix_cashback_transactions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_transactions_company_id ON public.cashback_transactions USING btree (company_id);


--
-- Name: ix_cashback_transactions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_cashback_transactions_id ON public.cashback_transactions USING btree (id);


--
-- Name: ix_clients_cellphone; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_cellphone ON public.clients USING btree (cellphone);


--
-- Name: ix_clients_cnpj; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_cnpj ON public.clients USING btree (cnpj);


--
-- Name: ix_clients_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_company_id ON public.clients USING btree (company_id);


--
-- Name: ix_clients_cpf; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_cpf ON public.clients USING btree (cpf);


--
-- Name: ix_clients_email; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_email ON public.clients USING btree (email);


--
-- Name: ix_clients_full_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_full_name ON public.clients USING btree (full_name);


--
-- Name: ix_clients_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_id ON public.clients USING btree (id);


--
-- Name: ix_clients_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_is_active ON public.clients USING btree (is_active);


--
-- Name: ix_clients_phone; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_clients_phone ON public.clients USING btree (phone);


--
-- Name: ix_clients_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_clients_user_id ON public.clients USING btree (user_id);


--
-- Name: ix_command_items_command_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_command_items_command_id ON public.command_items USING btree (command_id);


--
-- Name: ix_command_items_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_command_items_id ON public.command_items USING btree (id);


--
-- Name: ix_commands_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_client_crm_id ON public.commands USING btree (client_crm_id);


--
-- Name: ix_commands_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_company_id ON public.commands USING btree (company_id);


--
-- Name: ix_commands_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_date ON public.commands USING btree (date);


--
-- Name: ix_commands_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_id ON public.commands USING btree (id);


--
-- Name: ix_commands_number; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_number ON public.commands USING btree (number);


--
-- Name: ix_commands_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_professional_id ON public.commands USING btree (professional_id);


--
-- Name: ix_commands_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commands_status ON public.commands USING btree (status);


--
-- Name: ix_commission_configs_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_commission_configs_company_id ON public.commission_configs USING btree (company_id);


--
-- Name: ix_commission_configs_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commission_configs_id ON public.commission_configs USING btree (id);


--
-- Name: ix_commissions_command_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commissions_command_id ON public.commissions USING btree (command_id);


--
-- Name: ix_commissions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commissions_company_id ON public.commissions USING btree (company_id);


--
-- Name: ix_commissions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commissions_id ON public.commissions USING btree (id);


--
-- Name: ix_commissions_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commissions_professional_id ON public.commissions USING btree (professional_id);


--
-- Name: ix_commissions_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_commissions_status ON public.commissions USING btree (status);


--
-- Name: ix_companies_cnpj; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_companies_cnpj ON public.companies USING btree (cnpj);


--
-- Name: ix_companies_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_companies_id ON public.companies USING btree (id);


--
-- Name: ix_companies_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_companies_name ON public.companies USING btree (name);


--
-- Name: ix_companies_slug; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_companies_slug ON public.companies USING btree (slug);


--
-- Name: ix_company_add_ons_addon_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_add_ons_addon_id ON public.company_add_ons USING btree (addon_id);


--
-- Name: ix_company_add_ons_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_add_ons_company_id ON public.company_add_ons USING btree (company_id);


--
-- Name: ix_company_add_ons_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_add_ons_id ON public.company_add_ons USING btree (id);


--
-- Name: ix_company_add_ons_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_add_ons_is_active ON public.company_add_ons USING btree (is_active);


--
-- Name: ix_company_admin_settings_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_company_admin_settings_company_id ON public.company_admin_settings USING btree (company_id);


--
-- Name: ix_company_admin_settings_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_admin_settings_id ON public.company_admin_settings USING btree (id);


--
-- Name: ix_company_details_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_company_details_company_id ON public.company_details USING btree (company_id);


--
-- Name: ix_company_details_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_details_id ON public.company_details USING btree (id);


--
-- Name: ix_company_financial_settings_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_company_financial_settings_company_id ON public.company_financial_settings USING btree (company_id);


--
-- Name: ix_company_financial_settings_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_financial_settings_id ON public.company_financial_settings USING btree (id);


--
-- Name: ix_company_notification_settings_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_company_notification_settings_company_id ON public.company_notification_settings USING btree (company_id);


--
-- Name: ix_company_notification_settings_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_notification_settings_id ON public.company_notification_settings USING btree (id);


--
-- Name: ix_company_settings_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_company_settings_company_id ON public.company_settings USING btree (company_id);


--
-- Name: ix_company_settings_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_settings_id ON public.company_settings USING btree (id);


--
-- Name: ix_company_subscriptions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_subscriptions_company_id ON public.company_subscriptions USING btree (company_id);


--
-- Name: ix_company_subscriptions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_subscriptions_id ON public.company_subscriptions USING btree (id);


--
-- Name: ix_company_theme_settings_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_company_theme_settings_company_id ON public.company_theme_settings USING btree (company_id);


--
-- Name: ix_company_theme_settings_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_theme_settings_id ON public.company_theme_settings USING btree (id);


--
-- Name: ix_company_users_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_users_company_id ON public.company_users USING btree (company_id);


--
-- Name: ix_company_users_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_users_id ON public.company_users USING btree (id);


--
-- Name: ix_company_users_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_users_is_active ON public.company_users USING btree (is_active);


--
-- Name: ix_company_users_role; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_users_role ON public.company_users USING btree (role);


--
-- Name: ix_company_users_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_company_users_user_id ON public.company_users USING btree (user_id);


--
-- Name: ix_document_templates_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_document_templates_company_id ON public.document_templates USING btree (company_id);


--
-- Name: ix_document_templates_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_document_templates_id ON public.document_templates USING btree (id);


--
-- Name: ix_document_templates_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_document_templates_name ON public.document_templates USING btree (name);


--
-- Name: ix_evaluations_client_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_evaluations_client_id ON public.evaluations USING btree (client_id);


--
-- Name: ix_evaluations_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_evaluations_company_id ON public.evaluations USING btree (company_id);


--
-- Name: ix_evaluations_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_evaluations_id ON public.evaluations USING btree (id);


--
-- Name: ix_evaluations_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_evaluations_professional_id ON public.evaluations USING btree (professional_id);


--
-- Name: ix_financial_accounts_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_accounts_company_id ON public.financial_accounts USING btree (company_id);


--
-- Name: ix_financial_accounts_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_accounts_id ON public.financial_accounts USING btree (id);


--
-- Name: ix_financial_accounts_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_accounts_is_active ON public.financial_accounts USING btree (is_active);


--
-- Name: ix_financial_accounts_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_accounts_name ON public.financial_accounts USING btree (name);


--
-- Name: ix_financial_categories_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_categories_company_id ON public.financial_categories USING btree (company_id);


--
-- Name: ix_financial_categories_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_categories_id ON public.financial_categories USING btree (id);


--
-- Name: ix_financial_categories_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_categories_name ON public.financial_categories USING btree (name);


--
-- Name: ix_financial_transactions_client_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_client_id ON public.financial_transactions USING btree (client_id);


--
-- Name: ix_financial_transactions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_company_id ON public.financial_transactions USING btree (company_id);


--
-- Name: ix_financial_transactions_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_date ON public.financial_transactions USING btree (date);


--
-- Name: ix_financial_transactions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_id ON public.financial_transactions USING btree (id);


--
-- Name: ix_financial_transactions_is_paid; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_is_paid ON public.financial_transactions USING btree (is_paid);


--
-- Name: ix_financial_transactions_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_status ON public.financial_transactions USING btree (status);


--
-- Name: ix_financial_transactions_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_financial_transactions_type ON public.financial_transactions USING btree (type);


--
-- Name: ix_fiscal_configurations_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_fiscal_configurations_company_id ON public.fiscal_configurations USING btree (company_id);


--
-- Name: ix_fiscal_configurations_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_fiscal_configurations_id ON public.fiscal_configurations USING btree (id);


--
-- Name: ix_generated_documents_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_generated_documents_company_id ON public.generated_documents USING btree (company_id);


--
-- Name: ix_generated_documents_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_generated_documents_id ON public.generated_documents USING btree (id);


--
-- Name: ix_goals_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_company_id ON public.goals USING btree (company_id);


--
-- Name: ix_goals_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_id ON public.goals USING btree (id);


--
-- Name: ix_goals_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_is_active ON public.goals USING btree (is_active);


--
-- Name: ix_goals_period_end; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_period_end ON public.goals USING btree (period_end);


--
-- Name: ix_goals_period_start; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_period_start ON public.goals USING btree (period_start);


--
-- Name: ix_goals_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_professional_id ON public.goals USING btree (professional_id);


--
-- Name: ix_goals_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_goals_type ON public.goals USING btree (type);


--
-- Name: ix_invoices_access_key; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_invoices_access_key ON public.invoices USING btree (access_key);


--
-- Name: ix_invoices_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_invoices_company_id ON public.invoices USING btree (company_id);


--
-- Name: ix_invoices_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_invoices_id ON public.invoices USING btree (id);


--
-- Name: ix_invoices_invoice_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_invoices_invoice_type ON public.invoices USING btree (invoice_type);


--
-- Name: ix_invoices_number; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_invoices_number ON public.invoices USING btree (number);


--
-- Name: ix_invoices_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_invoices_status ON public.invoices USING btree (status);


--
-- Name: ix_notification_queue_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_queue_company_id ON public.notification_queue USING btree (company_id);


--
-- Name: ix_notification_queue_event_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_queue_event_type ON public.notification_queue USING btree (event_type);


--
-- Name: ix_notification_queue_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_queue_id ON public.notification_queue USING btree (id);


--
-- Name: ix_notification_queue_scheduled_at; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_queue_scheduled_at ON public.notification_queue USING btree (scheduled_at);


--
-- Name: ix_notification_queue_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_queue_status ON public.notification_queue USING btree (status);


--
-- Name: ix_notification_queue_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_queue_user_id ON public.notification_queue USING btree (user_id);


--
-- Name: ix_notification_templates_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_templates_company_id ON public.notification_templates USING btree (company_id);


--
-- Name: ix_notification_templates_event_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_templates_event_type ON public.notification_templates USING btree (event_type);


--
-- Name: ix_notification_templates_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_templates_id ON public.notification_templates USING btree (id);


--
-- Name: ix_notification_templates_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_templates_is_active ON public.notification_templates USING btree (is_active);


--
-- Name: ix_notification_triggers_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_triggers_company_id ON public.notification_triggers USING btree (company_id);


--
-- Name: ix_notification_triggers_event_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_triggers_event_type ON public.notification_triggers USING btree (event_type);


--
-- Name: ix_notification_triggers_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_triggers_id ON public.notification_triggers USING btree (id);


--
-- Name: ix_notification_triggers_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notification_triggers_is_active ON public.notification_triggers USING btree (is_active);


--
-- Name: ix_notifications_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);


--
-- Name: ix_notifications_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: ix_online_booking_business_hours_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_business_hours_company_id ON public.online_booking_business_hours USING btree (company_id);


--
-- Name: ix_online_booking_business_hours_config_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_business_hours_config_id ON public.online_booking_business_hours USING btree (config_id);


--
-- Name: ix_online_booking_business_hours_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_business_hours_id ON public.online_booking_business_hours USING btree (id);


--
-- Name: ix_online_booking_configs_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_online_booking_configs_company_id ON public.online_booking_configs USING btree (company_id);


--
-- Name: ix_online_booking_configs_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_configs_id ON public.online_booking_configs USING btree (id);


--
-- Name: ix_online_booking_gallery_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_gallery_company_id ON public.online_booking_gallery USING btree (company_id);


--
-- Name: ix_online_booking_gallery_config_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_gallery_config_id ON public.online_booking_gallery USING btree (config_id);


--
-- Name: ix_online_booking_gallery_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_online_booking_gallery_id ON public.online_booking_gallery USING btree (id);


--
-- Name: ix_package_plans_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_package_plans_company_id ON public.package_plans USING btree (company_id);


--
-- Name: ix_package_plans_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_package_plans_id ON public.package_plans USING btree (id);


--
-- Name: ix_packages_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_packages_client_crm_id ON public.packages USING btree (client_crm_id);


--
-- Name: ix_packages_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_packages_company_id ON public.packages USING btree (company_id);


--
-- Name: ix_packages_expiry_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_packages_expiry_date ON public.packages USING btree (expiry_date);


--
-- Name: ix_packages_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_packages_id ON public.packages USING btree (id);


--
-- Name: ix_packages_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_packages_status ON public.packages USING btree (status);


--
-- Name: ix_payment_forms_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payment_forms_company_id ON public.payment_forms USING btree (company_id);


--
-- Name: ix_payment_forms_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payment_forms_id ON public.payment_forms USING btree (id);


--
-- Name: ix_payment_forms_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payment_forms_name ON public.payment_forms USING btree (name);


--
-- Name: ix_payments_appointment_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payments_appointment_id ON public.payments USING btree (appointment_id);


--
-- Name: ix_payments_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payments_company_id ON public.payments USING btree (company_id);


--
-- Name: ix_payments_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payments_id ON public.payments USING btree (id);


--
-- Name: ix_payments_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payments_status ON public.payments USING btree (status);


--
-- Name: ix_payments_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_payments_user_id ON public.payments USING btree (user_id);


--
-- Name: ix_plans_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_plans_id ON public.plans USING btree (id);


--
-- Name: ix_plans_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_plans_is_active ON public.plans USING btree (is_active);


--
-- Name: ix_plans_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_plans_name ON public.plans USING btree (name);


--
-- Name: ix_plans_slug; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_plans_slug ON public.plans USING btree (slug);


--
-- Name: ix_predefined_packages_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_predefined_packages_company_id ON public.predefined_packages USING btree (company_id);


--
-- Name: ix_predefined_packages_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_predefined_packages_id ON public.predefined_packages USING btree (id);


--
-- Name: ix_predefined_packages_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_predefined_packages_name ON public.predefined_packages USING btree (name);


--
-- Name: ix_product_categories_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_product_categories_company_id ON public.product_categories USING btree (company_id);


--
-- Name: ix_product_categories_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_product_categories_id ON public.product_categories USING btree (id);


--
-- Name: ix_product_categories_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_product_categories_name ON public.product_categories USING btree (name);


--
-- Name: ix_products_barcode; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_products_barcode ON public.products USING btree (barcode);


--
-- Name: ix_products_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_products_company_id ON public.products USING btree (company_id);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_products_is_active ON public.products USING btree (is_active);


--
-- Name: ix_products_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_products_name ON public.products USING btree (name);


--
-- Name: ix_promotions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_promotions_company_id ON public.promotions USING btree (company_id);


--
-- Name: ix_promotions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_promotions_id ON public.promotions USING btree (id);


--
-- Name: ix_promotions_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_promotions_is_active ON public.promotions USING btree (is_active);


--
-- Name: ix_promotions_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_promotions_name ON public.promotions USING btree (name);


--
-- Name: ix_promotions_valid_from; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_promotions_valid_from ON public.promotions USING btree (valid_from);


--
-- Name: ix_promotions_valid_until; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_promotions_valid_until ON public.promotions USING btree (valid_until);


--
-- Name: ix_purchase_items_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchase_items_id ON public.purchase_items USING btree (id);


--
-- Name: ix_purchase_items_purchase_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchase_items_purchase_id ON public.purchase_items USING btree (purchase_id);


--
-- Name: ix_purchases_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchases_company_id ON public.purchases USING btree (company_id);


--
-- Name: ix_purchases_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchases_id ON public.purchases USING btree (id);


--
-- Name: ix_purchases_number; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchases_number ON public.purchases USING btree (number);


--
-- Name: ix_purchases_purchase_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchases_purchase_date ON public.purchases USING btree (purchase_date);


--
-- Name: ix_purchases_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchases_status ON public.purchases USING btree (status);


--
-- Name: ix_purchases_supplier_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_purchases_supplier_id ON public.purchases USING btree (supplier_id);


--
-- Name: ix_push_notification_logs_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_push_notification_logs_company_id ON public.push_notification_logs USING btree (company_id);


--
-- Name: ix_push_notification_logs_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_push_notification_logs_id ON public.push_notification_logs USING btree (id);


--
-- Name: ix_push_notification_logs_notification_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_push_notification_logs_notification_type ON public.push_notification_logs USING btree (notification_type);


--
-- Name: ix_push_notification_logs_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_push_notification_logs_status ON public.push_notification_logs USING btree (status);


--
-- Name: ix_push_notification_logs_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_push_notification_logs_user_id ON public.push_notification_logs USING btree (user_id);


--
-- Name: ix_resources_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_resources_company_id ON public.resources USING btree (company_id);


--
-- Name: ix_resources_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_resources_id ON public.resources USING btree (id);


--
-- Name: ix_reviews_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_reviews_client_crm_id ON public.reviews USING btree (client_crm_id);


--
-- Name: ix_reviews_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_reviews_company_id ON public.reviews USING btree (company_id);


--
-- Name: ix_reviews_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_reviews_id ON public.reviews USING btree (id);


--
-- Name: ix_reviews_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_reviews_professional_id ON public.reviews USING btree (professional_id);


--
-- Name: ix_service_categories_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_service_categories_company_id ON public.service_categories USING btree (company_id);


--
-- Name: ix_service_categories_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_service_categories_id ON public.service_categories USING btree (id);


--
-- Name: ix_service_professionals_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_service_professionals_id ON public.service_professionals USING btree (id);


--
-- Name: ix_service_professionals_professional_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_service_professionals_professional_id ON public.service_professionals USING btree (professional_id);


--
-- Name: ix_service_professionals_service_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_service_professionals_service_id ON public.service_professionals USING btree (service_id);


--
-- Name: ix_services_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_services_company_id ON public.services USING btree (company_id);


--
-- Name: ix_services_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_services_id ON public.services USING btree (id);


--
-- Name: ix_standalone_services_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_standalone_services_id ON public.standalone_services USING btree (id);


--
-- Name: ix_standalone_services_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_standalone_services_is_active ON public.standalone_services USING btree (is_active);


--
-- Name: ix_standalone_services_slug; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_standalone_services_slug ON public.standalone_services USING btree (slug);


--
-- Name: ix_subscription_sale_models_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sale_models_company_id ON public.subscription_sale_models USING btree (company_id);


--
-- Name: ix_subscription_sale_models_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sale_models_id ON public.subscription_sale_models USING btree (id);


--
-- Name: ix_subscription_sale_models_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sale_models_name ON public.subscription_sale_models USING btree (name);


--
-- Name: ix_subscription_sales_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sales_client_crm_id ON public.subscription_sales USING btree (client_crm_id);


--
-- Name: ix_subscription_sales_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sales_company_id ON public.subscription_sales USING btree (company_id);


--
-- Name: ix_subscription_sales_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sales_id ON public.subscription_sales USING btree (id);


--
-- Name: ix_subscription_sales_next_payment_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sales_next_payment_date ON public.subscription_sales USING btree (next_payment_date);


--
-- Name: ix_subscription_sales_start_date; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sales_start_date ON public.subscription_sales USING btree (start_date);


--
-- Name: ix_subscription_sales_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscription_sales_status ON public.subscription_sales USING btree (status);


--
-- Name: ix_subscriptions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscriptions_company_id ON public.subscriptions USING btree (company_id);


--
-- Name: ix_subscriptions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscriptions_id ON public.subscriptions USING btree (id);


--
-- Name: ix_subscriptions_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_subscriptions_user_id ON public.subscriptions USING btree (user_id);


--
-- Name: ix_suppliers_cnpj; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_suppliers_cnpj ON public.suppliers USING btree (cnpj);


--
-- Name: ix_suppliers_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_suppliers_company_id ON public.suppliers USING btree (company_id);


--
-- Name: ix_suppliers_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_suppliers_id ON public.suppliers USING btree (id);


--
-- Name: ix_suppliers_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_suppliers_name ON public.suppliers USING btree (name);


--
-- Name: ix_user_push_subscriptions_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_user_push_subscriptions_company_id ON public.user_push_subscriptions USING btree (company_id);


--
-- Name: ix_user_push_subscriptions_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_user_push_subscriptions_id ON public.user_push_subscriptions USING btree (id);


--
-- Name: ix_user_push_subscriptions_is_active; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_user_push_subscriptions_is_active ON public.user_push_subscriptions USING btree (is_active);


--
-- Name: ix_user_push_subscriptions_user_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_user_push_subscriptions_user_id ON public.user_push_subscriptions USING btree (user_id);


--
-- Name: ix_users_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_users_company_id ON public.users USING btree (company_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_role; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_users_role ON public.users USING btree (role);


--
-- Name: ix_users_saas_role; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_users_saas_role ON public.users USING btree (saas_role);


--
-- Name: ix_waitlist_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_waitlist_client_crm_id ON public.waitlist USING btree (client_crm_id);


--
-- Name: ix_waitlist_client_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_waitlist_client_id ON public.waitlist USING btree (client_id);


--
-- Name: ix_waitlist_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_waitlist_company_id ON public.waitlist USING btree (company_id);


--
-- Name: ix_waitlist_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_waitlist_id ON public.waitlist USING btree (id);


--
-- Name: ix_waitlist_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_waitlist_status ON public.waitlist USING btree (status);


--
-- Name: ix_whatsapp_automated_campaigns_campaign_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_automated_campaigns_campaign_type ON public.whatsapp_automated_campaigns USING btree (campaign_type);


--
-- Name: ix_whatsapp_automated_campaigns_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_automated_campaigns_company_id ON public.whatsapp_automated_campaigns USING btree (company_id);


--
-- Name: ix_whatsapp_automated_campaigns_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_automated_campaigns_id ON public.whatsapp_automated_campaigns USING btree (id);


--
-- Name: ix_whatsapp_campaign_logs_campaign_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_logs_campaign_id ON public.whatsapp_campaign_logs USING btree (campaign_id);


--
-- Name: ix_whatsapp_campaign_logs_client_crm_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_logs_client_crm_id ON public.whatsapp_campaign_logs USING btree (client_crm_id);


--
-- Name: ix_whatsapp_campaign_logs_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_logs_company_id ON public.whatsapp_campaign_logs USING btree (company_id);


--
-- Name: ix_whatsapp_campaign_logs_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_logs_id ON public.whatsapp_campaign_logs USING btree (id);


--
-- Name: ix_whatsapp_campaign_logs_phone_number; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_logs_phone_number ON public.whatsapp_campaign_logs USING btree (phone_number);


--
-- Name: ix_whatsapp_campaign_logs_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_logs_status ON public.whatsapp_campaign_logs USING btree (status);


--
-- Name: ix_whatsapp_campaign_triggers_automated_campaign_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_triggers_automated_campaign_id ON public.whatsapp_campaign_triggers USING btree (automated_campaign_id);


--
-- Name: ix_whatsapp_campaign_triggers_client_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_triggers_client_id ON public.whatsapp_campaign_triggers USING btree (client_id);


--
-- Name: ix_whatsapp_campaign_triggers_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_triggers_company_id ON public.whatsapp_campaign_triggers USING btree (company_id);


--
-- Name: ix_whatsapp_campaign_triggers_event_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_triggers_event_type ON public.whatsapp_campaign_triggers USING btree (event_type);


--
-- Name: ix_whatsapp_campaign_triggers_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_triggers_id ON public.whatsapp_campaign_triggers USING btree (id);


--
-- Name: ix_whatsapp_campaign_triggers_is_processed; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaign_triggers_is_processed ON public.whatsapp_campaign_triggers USING btree (is_processed);


--
-- Name: ix_whatsapp_campaigns_campaign_type; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaigns_campaign_type ON public.whatsapp_campaigns USING btree (campaign_type);


--
-- Name: ix_whatsapp_campaigns_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaigns_company_id ON public.whatsapp_campaigns USING btree (company_id);


--
-- Name: ix_whatsapp_campaigns_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaigns_id ON public.whatsapp_campaigns USING btree (id);


--
-- Name: ix_whatsapp_campaigns_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaigns_name ON public.whatsapp_campaigns USING btree (name);


--
-- Name: ix_whatsapp_campaigns_status; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_campaigns_status ON public.whatsapp_campaigns USING btree (status);


--
-- Name: ix_whatsapp_providers_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE UNIQUE INDEX ix_whatsapp_providers_company_id ON public.whatsapp_providers USING btree (company_id);


--
-- Name: ix_whatsapp_providers_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_providers_id ON public.whatsapp_providers USING btree (id);


--
-- Name: ix_whatsapp_templates_company_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_templates_company_id ON public.whatsapp_templates USING btree (company_id);


--
-- Name: ix_whatsapp_templates_id; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_templates_id ON public.whatsapp_templates USING btree (id);


--
-- Name: ix_whatsapp_templates_name; Type: INDEX; Schema: public; Owner: agendamento_app
--

CREATE INDEX ix_whatsapp_templates_name ON public.whatsapp_templates USING btree (name);


--
-- Name: anamneses anamneses_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT anamneses_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: anamneses anamneses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT anamneses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: anamneses anamneses_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT anamneses_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.anamnesis_models(id) ON DELETE CASCADE;


--
-- Name: anamneses anamneses_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamneses
    ADD CONSTRAINT anamneses_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: anamnesis_models anamnesis_models_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.anamnesis_models
    ADD CONSTRAINT anamnesis_models_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_cancelled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_resource_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: brands brands_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: cash_registers cash_registers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: cash_registers cash_registers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cash_registers
    ADD CONSTRAINT cash_registers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cashback_balances cashback_balances_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_balances
    ADD CONSTRAINT cashback_balances_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: cashback_balances cashback_balances_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_balances
    ADD CONSTRAINT cashback_balances_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: cashback_rules cashback_rules_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_rules
    ADD CONSTRAINT cashback_rules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: cashback_transactions cashback_transactions_balance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_balance_id_fkey FOREIGN KEY (balance_id) REFERENCES public.cashback_balances(id) ON DELETE CASCADE;


--
-- Name: cashback_transactions cashback_transactions_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.commands(id) ON DELETE SET NULL;


--
-- Name: cashback_transactions cashback_transactions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: cashback_transactions cashback_transactions_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.cashback_transactions
    ADD CONSTRAINT cashback_transactions_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.cashback_rules(id) ON DELETE SET NULL;


--
-- Name: clients clients_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: clients clients_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: command_items command_items_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items
    ADD CONSTRAINT command_items_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.commands(id) ON DELETE CASCADE;


--
-- Name: command_items command_items_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items
    ADD CONSTRAINT command_items_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id) ON DELETE SET NULL;


--
-- Name: command_items command_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items
    ADD CONSTRAINT command_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: command_items command_items_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items
    ADD CONSTRAINT command_items_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: command_items command_items_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.command_items
    ADD CONSTRAINT command_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: commands commands_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: commands commands_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: commands commands_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: commands commands_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commands
    ADD CONSTRAINT commands_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: commission_configs commission_configs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commission_configs
    ADD CONSTRAINT commission_configs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.commands(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_command_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_command_item_id_fkey FOREIGN KEY (command_item_id) REFERENCES public.command_items(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: commissions commissions_financial_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_financial_transaction_id_fkey FOREIGN KEY (financial_transaction_id) REFERENCES public.financial_transactions(id) ON DELETE SET NULL;


--
-- Name: commissions commissions_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: company_add_ons company_add_ons_addon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_add_ons
    ADD CONSTRAINT company_add_ons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.add_ons(id) ON DELETE CASCADE;


--
-- Name: company_add_ons company_add_ons_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_add_ons
    ADD CONSTRAINT company_add_ons_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_admin_settings company_admin_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_admin_settings
    ADD CONSTRAINT company_admin_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_details company_details_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_details
    ADD CONSTRAINT company_details_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_financial_settings company_financial_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_financial_settings
    ADD CONSTRAINT company_financial_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_notification_settings company_notification_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_notification_settings
    ADD CONSTRAINT company_notification_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_settings company_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_subscriptions company_subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_subscriptions
    ADD CONSTRAINT company_subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_theme_settings company_theme_settings_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_theme_settings
    ADD CONSTRAINT company_theme_settings_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_users company_users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: company_users company_users_invited_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_invited_by_id_fkey FOREIGN KEY (invited_by_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: company_users company_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: document_templates document_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evaluations evaluations_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: evaluations evaluations_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: evaluations evaluations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: evaluations evaluations_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.evaluations
    ADD CONSTRAINT evaluations_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: financial_accounts financial_accounts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_accounts
    ADD CONSTRAINT financial_accounts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: financial_categories financial_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_categories
    ADD CONSTRAINT financial_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: financial_categories financial_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_categories
    ADD CONSTRAINT financial_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.financial_categories(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.financial_accounts(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.financial_categories(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.commands(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: financial_transactions financial_transactions_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_subscription_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_subscription_sale_id_fkey FOREIGN KEY (subscription_sale_id) REFERENCES public.subscription_sales(id) ON DELETE SET NULL;


--
-- Name: fiscal_configurations fiscal_configurations_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.fiscal_configurations
    ADD CONSTRAINT fiscal_configurations_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: companies fk_companies_subscription_plan_id; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT fk_companies_subscription_plan_id FOREIGN KEY (subscription_plan_id) REFERENCES public.plans(id);


--
-- Name: generated_documents generated_documents_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: generated_documents generated_documents_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.commands(id) ON DELETE SET NULL;


--
-- Name: generated_documents generated_documents_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: generated_documents generated_documents_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.document_templates(id) ON DELETE CASCADE;


--
-- Name: goals goals_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: goals goals_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.commands(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notification_queue notification_queue_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notification_queue notification_queue_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE SET NULL;


--
-- Name: notification_queue notification_queue_trigger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_trigger_id_fkey FOREIGN KEY (trigger_id) REFERENCES public.notification_triggers(id) ON DELETE SET NULL;


--
-- Name: notification_queue notification_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_queue
    ADD CONSTRAINT notification_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notification_templates notification_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notification_templates notification_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_triggers notification_triggers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_triggers
    ADD CONSTRAINT notification_triggers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: notification_triggers notification_triggers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_triggers
    ADD CONSTRAINT notification_triggers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notification_triggers notification_triggers_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notification_triggers
    ADD CONSTRAINT notification_triggers_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.notification_templates(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: online_booking_business_hours online_booking_business_hours_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_business_hours
    ADD CONSTRAINT online_booking_business_hours_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: online_booking_business_hours online_booking_business_hours_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_business_hours
    ADD CONSTRAINT online_booking_business_hours_config_id_fkey FOREIGN KEY (config_id) REFERENCES public.online_booking_configs(id) ON DELETE CASCADE;


--
-- Name: online_booking_configs online_booking_configs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_configs
    ADD CONSTRAINT online_booking_configs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: online_booking_gallery online_booking_gallery_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_gallery
    ADD CONSTRAINT online_booking_gallery_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: online_booking_gallery online_booking_gallery_config_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.online_booking_gallery
    ADD CONSTRAINT online_booking_gallery_config_id_fkey FOREIGN KEY (config_id) REFERENCES public.online_booking_configs(id) ON DELETE CASCADE;


--
-- Name: packages packages_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: packages packages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: packages packages_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;


--
-- Name: packages packages_predefined_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.packages
    ADD CONSTRAINT packages_predefined_package_id_fkey FOREIGN KEY (predefined_package_id) REFERENCES public.predefined_packages(id) ON DELETE CASCADE;


--
-- Name: payment_forms payment_forms_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payment_forms
    ADD CONSTRAINT payment_forms_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payments payments_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: payments payments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: package_plans plans_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.package_plans
    ADD CONSTRAINT plans_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: predefined_packages predefined_packages_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.predefined_packages
    ADD CONSTRAINT predefined_packages_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: product_categories product_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE SET NULL;


--
-- Name: products products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: promotions promotions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchase_items purchase_items_purchase_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchase_items
    ADD CONSTRAINT purchase_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;


--
-- Name: push_notification_logs push_notification_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.push_notification_logs
    ADD CONSTRAINT push_notification_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: push_notification_logs push_notification_logs_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.push_notification_logs
    ADD CONSTRAINT push_notification_logs_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_push_subscriptions(id) ON DELETE SET NULL;


--
-- Name: push_notification_logs push_notification_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.push_notification_logs
    ADD CONSTRAINT push_notification_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: resources resources_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_categories service_categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: service_professionals service_professionals_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_professionals
    ADD CONSTRAINT service_professionals_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_professionals service_professionals_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.service_professionals
    ADD CONSTRAINT service_professionals_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE SET NULL;


--
-- Name: services services_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: subscription_sale_models subscription_sale_models_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sale_models
    ADD CONSTRAINT subscription_sale_models_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: subscription_sales subscription_sales_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sales
    ADD CONSTRAINT subscription_sales_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: subscription_sales subscription_sales_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sales
    ADD CONSTRAINT subscription_sales_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: subscription_sales subscription_sales_model_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscription_sales
    ADD CONSTRAINT subscription_sales_model_id_fkey FOREIGN KEY (model_id) REFERENCES public.subscription_sale_models(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.package_plans(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: suppliers suppliers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_push_subscriptions user_push_subscriptions_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.user_push_subscriptions
    ADD CONSTRAINT user_push_subscriptions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: user_push_subscriptions user_push_subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.user_push_subscriptions
    ADD CONSTRAINT user_push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: waitlist waitlist_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: waitlist waitlist_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: waitlist waitlist_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.waitlist
    ADD CONSTRAINT waitlist_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: whatsapp_automated_campaigns whatsapp_automated_campaigns_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_automated_campaigns
    ADD CONSTRAINT whatsapp_automated_campaigns_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT whatsapp_campaign_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.whatsapp_campaigns(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_client_crm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT whatsapp_campaign_logs_client_crm_id_fkey FOREIGN KEY (client_crm_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_logs
    ADD CONSTRAINT whatsapp_campaign_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_triggers whatsapp_campaign_triggers_automated_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_triggers
    ADD CONSTRAINT whatsapp_campaign_triggers_automated_campaign_id_fkey FOREIGN KEY (automated_campaign_id) REFERENCES public.whatsapp_automated_campaigns(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_triggers whatsapp_campaign_triggers_campaign_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_triggers
    ADD CONSTRAINT whatsapp_campaign_triggers_campaign_log_id_fkey FOREIGN KEY (campaign_log_id) REFERENCES public.whatsapp_campaign_logs(id) ON DELETE SET NULL;


--
-- Name: whatsapp_campaign_triggers whatsapp_campaign_triggers_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_triggers
    ADD CONSTRAINT whatsapp_campaign_triggers_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaign_triggers whatsapp_campaign_triggers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaign_triggers
    ADD CONSTRAINT whatsapp_campaign_triggers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaigns whatsapp_campaigns_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT whatsapp_campaigns_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: whatsapp_campaigns whatsapp_campaigns_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_campaigns
    ADD CONSTRAINT whatsapp_campaigns_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL;


--
-- Name: whatsapp_providers whatsapp_providers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_providers
    ADD CONSTRAINT whatsapp_providers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: whatsapp_templates whatsapp_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: agendamento_app
--

ALTER TABLE ONLY public.whatsapp_templates
    ADD CONSTRAINT whatsapp_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: anamneses; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;

--
-- Name: anamneses anamneses_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY anamneses_tenant_isolation ON public.anamneses USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: anamnesis_models; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.anamnesis_models ENABLE ROW LEVEL SECURITY;

--
-- Name: anamnesis_models anamnesis_models_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY anamnesis_models_tenant_isolation ON public.anamnesis_models USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: api_keys; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

--
-- Name: api_keys api_keys_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY api_keys_tenant_isolation ON public.api_keys USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments appointments_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY appointments_tenant_isolation ON public.appointments USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: cash_registers; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.cash_registers ENABLE ROW LEVEL SECURITY;

--
-- Name: cash_registers cash_registers_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY cash_registers_tenant_isolation ON public.cash_registers USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: cashback_balances; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.cashback_balances ENABLE ROW LEVEL SECURITY;

--
-- Name: cashback_balances cashback_balances_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY cashback_balances_tenant_isolation ON public.cashback_balances USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: cashback_rules; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.cashback_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: cashback_rules cashback_rules_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY cashback_rules_tenant_isolation ON public.cashback_rules USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: cashback_transactions; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.cashback_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: cashback_transactions cashback_transactions_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY cashback_transactions_tenant_isolation ON public.cashback_transactions USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: clients clients_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY clients_tenant_isolation ON public.clients USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: commands; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.commands ENABLE ROW LEVEL SECURITY;

--
-- Name: commands commands_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY commands_tenant_isolation ON public.commands USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: commission_configs; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.commission_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: commission_configs commission_configs_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY commission_configs_tenant_isolation ON public.commission_configs USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: commissions; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

--
-- Name: commissions commissions_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY commissions_tenant_isolation ON public.commissions USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: company_settings; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: company_settings company_settings_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY company_settings_tenant_isolation ON public.company_settings USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: company_subscriptions; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: company_subscriptions company_subscriptions_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY company_subscriptions_tenant_isolation ON public.company_subscriptions USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: company_users; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

--
-- Name: company_users company_users_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY company_users_tenant_isolation ON public.company_users USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: document_templates; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: document_templates document_templates_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY document_templates_tenant_isolation ON public.document_templates USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: evaluations; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

--
-- Name: evaluations evaluations_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY evaluations_tenant_isolation ON public.evaluations USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: financial_accounts; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_accounts financial_accounts_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY financial_accounts_tenant_isolation ON public.financial_accounts USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: financial_categories; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_categories financial_categories_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY financial_categories_tenant_isolation ON public.financial_categories USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: financial_transactions; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_transactions financial_transactions_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY financial_transactions_tenant_isolation ON public.financial_transactions USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: generated_documents; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: generated_documents generated_documents_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY generated_documents_tenant_isolation ON public.generated_documents USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: goals; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

--
-- Name: goals goals_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY goals_tenant_isolation ON public.goals USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices invoices_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY invoices_tenant_isolation ON public.invoices USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: online_booking_configs; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.online_booking_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: online_booking_configs online_booking_configs_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY online_booking_configs_tenant_isolation ON public.online_booking_configs USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: packages; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

--
-- Name: packages packages_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY packages_tenant_isolation ON public.packages USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: payment_forms; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.payment_forms ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_forms payment_forms_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY payment_forms_tenant_isolation ON public.payment_forms USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: product_categories; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: product_categories product_categories_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY product_categories_tenant_isolation ON public.product_categories USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: products products_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY products_tenant_isolation ON public.products USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: promotions; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: promotions promotions_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY promotions_tenant_isolation ON public.promotions USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: purchases; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: purchases purchases_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY purchases_tenant_isolation ON public.purchases USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: resources resources_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY resources_tenant_isolation ON public.resources USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews reviews_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY reviews_tenant_isolation ON public.reviews USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: service_categories; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: service_categories service_categories_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY service_categories_tenant_isolation ON public.service_categories USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: services services_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY services_tenant_isolation ON public.services USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: subscription_sales; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.subscription_sales ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_sales subscription_sales_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY subscription_sales_tenant_isolation ON public.subscription_sales USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers suppliers_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY suppliers_tenant_isolation ON public.suppliers USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: user_push_subscriptions; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_push_subscriptions user_push_subscriptions_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY user_push_subscriptions_tenant_isolation ON public.user_push_subscriptions USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: whatsapp_automated_campaigns; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.whatsapp_automated_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_automated_campaigns whatsapp_automated_campaigns_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY whatsapp_automated_campaigns_tenant_isolation ON public.whatsapp_automated_campaigns USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: whatsapp_campaign_logs; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.whatsapp_campaign_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_campaign_logs whatsapp_campaign_logs_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY whatsapp_campaign_logs_tenant_isolation ON public.whatsapp_campaign_logs USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: whatsapp_campaigns; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.whatsapp_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_campaigns whatsapp_campaigns_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY whatsapp_campaigns_tenant_isolation ON public.whatsapp_campaigns USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- Name: whatsapp_providers; Type: ROW SECURITY; Schema: public; Owner: agendamento_app
--

ALTER TABLE public.whatsapp_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_providers whatsapp_providers_tenant_isolation; Type: POLICY; Schema: public; Owner: agendamento_app
--

CREATE POLICY whatsapp_providers_tenant_isolation ON public.whatsapp_providers USING ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer))) WITH CHECK ((company_id = COALESCE((NULLIF(current_setting('app.current_company_id'::text, true), ''::text))::integer, '-1'::integer)));


--
-- PostgreSQL database dump complete
--

\unrestrict grv6Rartrlu9Kj5Qaek4CcbJoakUUVWGgDEPW7p9XZ5aXi2QFS68FYSxgBLgBTa

