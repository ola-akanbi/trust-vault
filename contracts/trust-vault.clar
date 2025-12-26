;; TrustVault: Self-Sovereign Identity & Verifiable Credential Platform
;;
;; A comprehensive blockchain-based identity management system that enables 
;; users to maintain full control over their digital identity while providing
;; robust mechanisms for credential issuance, verification, and reputation
;; tracking through zero-knowledge proofs and cryptographic attestations.
;;
;; Key Features:
;; - Self-sovereign identity registration with cryptographic hash anchoring
;; - Verifiable credential lifecycle management (issue, verify, revoke)
;; - Zero-knowledge proof submission and verification framework
;; - Dynamic reputation scoring system with administrative oversight
;; - Secure identity recovery mechanisms with designated recovery addresses
;; - Comprehensive input validation and security controls
;;
;; Clarity 4 Features:
;; - Uses stacks-block-time for accurate timestamp-based logic
;; - Enhanced time-based credential expiration with Unix timestamps
;; - Improved temporal tracking for identity and credential lifecycle

;; ERROR CONSTANTS

(define-constant ERR-NOT-AUTHORIZED (err u1000))
(define-constant ERR-ALREADY-REGISTERED (err u1001))
(define-constant ERR-NOT-REGISTERED (err u1002))
(define-constant ERR-INVALID-PROOF (err u1003))
(define-constant ERR-INVALID-CREDENTIAL (err u1004))
(define-constant ERR-EXPIRED-CREDENTIAL (err u1005))
(define-constant ERR-REVOKED-CREDENTIAL (err u1006))
(define-constant ERR-INVALID-SCORE (err u1007))
(define-constant ERR-INVALID-INPUT (err u1008))
(define-constant ERR-INVALID-EXPIRATION (err u1009))
(define-constant ERR-INVALID-RECOVERY-ADDRESS (err u1010))
(define-constant ERR-INVALID-PROOF-DATA (err u1011))
(define-constant ERR-CONTRACT-PAUSED (err u1012))

;; SYSTEM CONSTANTS

(define-constant MIN-REPUTATION-SCORE u0)
(define-constant MAX-REPUTATION-SCORE u1000)
(define-constant MIN-EXPIRATION-BLOCKS u1)
(define-constant MAX-METADATA-LENGTH u256)
(define-constant MINIMUM-PROOF-SIZE u64)

;; DATA STRUCTURES

;; Identity Registry: Maps principals to their identity metadata
(define-map identities
  principal
  {
    hash: (buff 32),
    credentials: (list 10 principal),
    reputation-score: uint,
    recovery-address: (optional principal),
    last-updated: uint,
    last-updated-time: uint,  ;; Clarity 4: Unix timestamp from stacks-block-time
    status: (string-ascii 20),
  }
)

;; Credential Registry: Stores verifiable credentials with issuer-nonce composite key
(define-map credentials
  {
    issuer: principal,
    nonce: uint,
  }
  {
    subject: principal,
    claim-hash: (buff 32),
    expiration: uint,
    expiration-time: uint,  ;; Clarity 4: Unix timestamp expiration
    revoked: bool,
    issued-at: uint,  ;; Clarity 4: Unix timestamp of issuance
    metadata: (string-utf8 256),
  }
)

;; Zero-Knowledge Proof Storage: Manages cryptographic proofs and verification status
(define-map zero-knowledge-proofs
  (buff 32)
  {
    prover: principal,
    verified: bool,
    timestamp: uint,
    timestamp-unix: uint,  ;; Clarity 4: Unix timestamp from stacks-block-time
    proof-data: (buff 1024),
  }
)

;; STATE VARIABLES

(define-data-var admin principal tx-sender)
(define-data-var credential-nonce uint u0)
(define-data-var contract-paused bool false)
(define-data-var pause-guardian (optional principal) none)

;; VALIDATION FUNCTIONS

;; Checks if contract is currently paused
(define-private (is-paused)
  (var-get contract-paused)
)

;; Validates recovery address to prevent security vulnerabilities
(define-private (is-valid-recovery-address (recovery-addr (optional principal)))
  (match recovery-addr
    recovery-principal (and
      (not (is-eq recovery-principal tx-sender))
      (not (is-eq recovery-principal (var-get admin)))
    )
    true
  )
)

;; Ensures proof data meets minimum security requirements
(define-private (is-valid-proof-data (proof-data (buff 1024)))
  (let ((proof-len (len proof-data)))
    (and
      (>= proof-len MINIMUM-PROOF-SIZE)
      (not (is-eq proof-data 0x))
    )
  )
)

;; Validates credential expiration times
(define-private (is-valid-expiration (expiration uint))
  (> expiration (+ stacks-block-height MIN-EXPIRATION-BLOCKS))
)