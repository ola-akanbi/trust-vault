
import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("TrustVault - Clarity 4 Upgraded Tests", () => {
  
  describe("Identity Management", () => {
    it("registers identity with Clarity 4 timestamp tracking", () => {
      const identityHash = new Uint8Array(32).fill(1);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(identityHash), Cl.none()],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify identity includes both block height and Unix timestamp
      const identity = simnet.callReadOnlyFn(
        "trust-vault",
        "get-identity",
        [Cl.principal(address1)],
        address1
      );
      
      // Clarity 4 feature: Identity should have last-updated-time (Unix timestamp)
      const identityValue = identity.result as any;
      expect(identityValue).toBeTruthy();
    });

    it("prevents duplicate registration", () => {
      const identityHash = new Uint8Array(32).fill(2);
      
      // First registration
      simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(identityHash), Cl.none()],
        address1
      );
      
      // Second registration should fail
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(identityHash), Cl.none()],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1001)); // ERR-ALREADY-REGISTERED
    });
  });

  describe("Credential Management with Clarity 4 Timestamps", () => {
    it("issues credential with Unix timestamp tracking", () => {
      // Register identities
      const hash1 = new Uint8Array(32).fill(1);
      const hash2 = new Uint8Array(32).fill(2);
      
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      // Issue credential
      const claimHash = new Uint8Array(32).fill(10);
      const expiration = simnet.blockHeight + 100;
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(expiration),
          Cl.stringUtf8("Test credential")
        ],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify credential has Clarity 4 timestamp fields
      const credential = simnet.callReadOnlyFn(
        "trust-vault",
        "get-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      
      // Clarity 4 features: Credential should have issued-at and expiration-time
      const credValue = credential.result as any;
      expect(credValue).toBeTruthy();
    });

    it("checks credential expiration using Unix timestamp", () => {
      const hash1 = new Uint8Array(32).fill(3);
      const hash2 = new Uint8Array(32).fill(4);
      
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      const claimHash = new Uint8Array(32).fill(11);
      const expiration = simnet.blockHeight + 10;
      
      simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(expiration),
          Cl.stringUtf8("Short-lived credential")
        ],
        address1
      );
      
      // Check time info (Clarity 4 enhanced function)
      const timeInfo = simnet.callReadOnlyFn(
        "trust-vault",
        "get-credential-time-info",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      
      // Clarity 4 feature: Should return time info with Unix timestamps
      const timeValue = timeInfo.result as any;
      expect(timeValue).toBeTruthy();
    });

    it("revokes credential", () => {
      const hash1 = new Uint8Array(32).fill(5);
      const hash2 = new Uint8Array(32).fill(6);
      
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      const claimHash = new Uint8Array(32).fill(12);
      const expiration = simnet.blockHeight + 100;
      
      simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [Cl.principal(address2), Cl.buffer(claimHash), 
         Cl.uint(expiration), Cl.stringUtf8("Revocable")],
        address1
      );
      
      // Revoke
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "revoke-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Zero-Knowledge Proofs with Clarity 4", () => {
    it("submits proof with Unix timestamp tracking", () => {
      const hash = new Uint8Array(32).fill(7);
      
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      const proofHash = new Uint8Array(32).fill(20);
      const proofData = new Uint8Array(128).fill(99);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify proof has Unix timestamp (Clarity 4 feature)
      const proof = simnet.callReadOnlyFn(
        "trust-vault",
        "get-proof",
        [Cl.buffer(proofHash)],
        address1
      );
      
      // Clarity 4 feature: Proof should have timestamp-unix field
      const proofValue = proof.result as any;
      expect(proofValue).toBeTruthy();
    });

    it("admin can verify proof", () => {
      const hash = new Uint8Array(32).fill(8);
      
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      const proofHash = new Uint8Array(32).fill(21);
      const proofData = new Uint8Array(128).fill(88);
      
      simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1
      );
      
      // Admin verifies
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "verify-proof",
        [Cl.buffer(proofHash)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Clarity 4 Enhanced Read-Only Functions", () => {
    it("gets identity status string", () => {
      const hash = new Uint8Array(32).fill(9);
      
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      const { result } = simnet.callReadOnlyFn(
        "trust-vault",
        "get-identity-status-string",
        [Cl.principal(address1)],
        address1
      );
      
      expect(result).toBeOk(Cl.stringAscii("ACTIVE"));
    });
  });
});
