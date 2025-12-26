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