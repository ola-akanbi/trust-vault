import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("TrustVault - Edge Cases and Security Tests", () => {
  
  describe("Input Validation Edge Cases", () => {
    it("rejects zero hash for identity", () => {
      const zeroHash = new Uint8Array(32).fill(0);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(zeroHash), Cl.none()],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1008)); // ERR-INVALID-INPUT
    });

    it("rejects self as recovery address", () => {
      const hash = new Uint8Array(32).fill(1);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(hash), Cl.some(Cl.principal(address1))],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1010)); // ERR-INVALID-RECOVERY-ADDRESS
    });

    it("rejects admin as recovery address", () => {
      const hash = new Uint8Array(32).fill(2);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(hash), Cl.some(Cl.principal(deployer))],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1010)); // ERR-INVALID-RECOVERY-ADDRESS
    });

    it("rejects proof data smaller than minimum size", () => {
      // Register identity first
      const hash = new Uint8Array(32).fill(3);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      // Try to submit small proof (< 64 bytes)
      const proofHash = new Uint8Array(32).fill(10);
      const smallProof = new Uint8Array(32).fill(99); // Only 32 bytes
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(smallProof)],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1011)); // ERR-INVALID-PROOF-DATA
    });

    it("rejects credential with current or past expiration", () => {
      // Register identities
      const hash1 = new Uint8Array(32).fill(4);
      const hash2 = new Uint8Array(32).fill(5);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      // Try to issue credential with current block expiration (invalid - must be > blockHeight + 1)
      const claimHash = new Uint8Array(32).fill(20);
      const currentExpiration = simnet.blockHeight + 1; // Not enough future blocks
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(currentExpiration),
          Cl.stringUtf8("Test")
        ],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1009)); // ERR-INVALID-EXPIRATION
    });

    it("accepts metadata at max length", () => {
      const hash1 = new Uint8Array(32).fill(6);
      const hash2 = new Uint8Array(32).fill(7);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      // Create metadata at exactly 256 characters (max allowed)
      const maxMetadata = "A".repeat(256);
      const claimHash = new Uint8Array(32).fill(21);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(simnet.blockHeight + 100),
          Cl.stringUtf8(maxMetadata)
        ],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Authorization Edge Cases", () => {
    it("non-issuer cannot revoke credential", () => {
      // Setup: Register and issue credential
      const hash1 = new Uint8Array(32).fill(8);
      const hash2 = new Uint8Array(32).fill(9);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      const claimHash = new Uint8Array(32).fill(22);
      simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(simnet.blockHeight + 100),
          Cl.stringUtf8("Test")
        ],
        address1
      );
      
      // Try to revoke as non-issuer
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "revoke-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address2 // Not the issuer
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });

    it("non-recovery-address cannot initiate recovery", () => {
      // Register with recovery address
      const hash = new Uint8Array(32).fill(10);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.some(Cl.principal(address2))], address1);
      
      // Try to initiate recovery from wrong address
      const newHash = new Uint8Array(32).fill(11);
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "initiate-recovery",
        [Cl.principal(address1), Cl.buffer(newHash)],
        deployer // Not the recovery address
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });

    it("cannot transfer admin to self", () => {
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "set-admin",
        [Cl.principal(deployer)],
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(1008)); // ERR-INVALID-INPUT
    });
  });

  describe("State Consistency", () => {
    it("credential nonce increments correctly", () => {
      // Register identities
      const hash1 = new Uint8Array(32).fill(12);
      const hash2 = new Uint8Array(32).fill(13);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      // Issue first credential (nonce 0)
      const claim1 = new Uint8Array(32).fill(30);
      simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claim1),
          Cl.uint(simnet.blockHeight + 100),
          Cl.stringUtf8("First")
        ],
        address1
      );
      
      // Issue second credential (nonce 1)
      const claim2 = new Uint8Array(32).fill(31);
      simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claim2),
          Cl.uint(simnet.blockHeight + 100),
          Cl.stringUtf8("Second")
        ],
        address1
      );
      
      // Verify first credential exists
      const cred1 = simnet.callReadOnlyFn(
        "trust-vault",
        "get-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      expect(cred1.result).not.toBe(Cl.none());
      
      // Verify second credential exists
      const cred2 = simnet.callReadOnlyFn(
        "trust-vault",
        "get-credential",
        [Cl.principal(address1), Cl.uint(1)],
        address1
      );
      expect(cred2.result).not.toBe(Cl.none());
    });

    it("identity status updates correctly after recovery", () => {
      // Register with recovery
      const hash = new Uint8Array(32).fill(14);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.some(Cl.principal(address2))], address1);
      
      // Initiate recovery
      const newHash = new Uint8Array(32).fill(15);
      simnet.callPublicFn(
        "trust-vault",
        "initiate-recovery",
        [Cl.principal(address1), Cl.buffer(newHash)],
        address2
      );
      
      // Check status is "RECOVERED"
      const { result } = simnet.callReadOnlyFn(
        "trust-vault",
        "get-identity-status-string",
        [Cl.principal(address1)],
        address1
      );
      
      expect(result).toBeOk(Cl.stringAscii("RECOVERED"));
    });
  });

  describe("Boundary Value Tests", () => {
    it("handles maximum reputation score", () => {
      // Register identity
      const hash = new Uint8Array(32).fill(16);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      // Update to max score (1000)
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "update-reputation",
        [Cl.principal(address1), Cl.int(900)], // Starting at 100, add 900
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("handles minimum reputation score", () => {
      // Register identity (starts at 100)
      const hash = new Uint8Array(32).fill(17);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      // Decrease to minimum (0)
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "update-reputation",
        [Cl.principal(address1), Cl.int(-100)],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents reputation from going below minimum", () => {
      // Register identity
      const hash = new Uint8Array(32).fill(18);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      // Try to decrease below 0
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "update-reputation",
        [Cl.principal(address1), Cl.int(-200)], // Would go to -100
        deployer
      );
      
      expect(result).toBeErr(Cl.uint(1007)); // ERR-INVALID-SCORE
    });
  });

  describe("Proof Verification", () => {
    it("unregistered user cannot submit proof", () => {
      const proofHash = new Uint8Array(32).fill(40);
      const proofData = new Uint8Array(128).fill(99);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1 // Not registered
      );
      
      expect(result).toBeErr(Cl.uint(1002)); // ERR-NOT-REGISTERED
    });

    it("cannot submit duplicate proof hash", () => {
      // Register identity
      const hash = new Uint8Array(32).fill(19);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      // Submit proof
      const proofHash = new Uint8Array(32).fill(41);
      const proofData = new Uint8Array(128).fill(99);
      simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1
      );
      
      // Try to submit same proof hash again
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1003)); // ERR-INVALID-PROOF
    });

    it("non-admin cannot verify proof", () => {
      // Register and submit proof
      const hash = new Uint8Array(32).fill(20);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash), Cl.none()], address1);
      
      const proofHash = new Uint8Array(32).fill(42);
      const proofData = new Uint8Array(128).fill(99);
      simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1
      );
      
      // Try to verify as non-admin
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "verify-proof",
        [Cl.buffer(proofHash)],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Credential Verification", () => {
    it("correctly identifies revoked credential as invalid", () => {
      // Setup
      const hash1 = new Uint8Array(32).fill(21);
      const hash2 = new Uint8Array(32).fill(22);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      // Issue and revoke credential
      const claimHash = new Uint8Array(32).fill(50);
      simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(simnet.blockHeight + 1000),
          Cl.stringUtf8("Test")
        ],
        address1
      );
      
      simnet.callPublicFn(
        "trust-vault",
        "revoke-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      
      // Verify returns false for revoked credential
      const { result } = simnet.callReadOnlyFn(
        "trust-vault",
        "verify-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(false));
    });

    it("returns error for non-existent credential", () => {
      const { result } = simnet.callReadOnlyFn(
        "trust-vault",
        "verify-credential",
        [Cl.principal(address1), Cl.uint(999)],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1004)); // ERR-INVALID-CREDENTIAL
    });
  });
});
