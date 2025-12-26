import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;

describe("TrustVault - Emergency Pause Mechanism Tests", () => {
  
  describe("Pause/Unpause Functionality", () => {
    it("admin can pause the contract", () => {
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "pause-contract",
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("prevents operations when contract is paused", () => {
      // Pause contract
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
      
      // Try to register identity while paused
      const identityHash = new Uint8Array(32).fill(1);
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(identityHash), Cl.none()],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1012)); // ERR-CONTRACT-PAUSED
    });

    it("admin can unpause the contract", () => {
      // Pause first
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
      
      // Unpause
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "unpause-contract",
        [],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("operations work after unpause", () => {
      // Pause
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
      
      // Unpause
      simnet.callPublicFn("trust-vault", "unpause-contract", [], deployer);
      
      // Register identity should work now
      const identityHash = new Uint8Array(32).fill(2);
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "register-identity",
        [Cl.buffer(identityHash), Cl.none()],
        address1
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("non-admin cannot unpause", () => {
      // Admin pauses
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
      
      // Non-admin tries to unpause
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "unpause-contract",
        [],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });

    it("non-admin cannot pause (without guardian)", () => {
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "pause-contract",
        [],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Pause Guardian", () => {
    it("admin can set pause guardian", () => {
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "set-pause-guardian",
        [Cl.some(Cl.principal(address2))],
        deployer
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("pause guardian can pause contract", () => {
      // Set guardian
      simnet.callPublicFn(
        "trust-vault",
        "set-pause-guardian",
        [Cl.some(Cl.principal(address2))],
        deployer
      );
      
      // Guardian pauses
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "pause-contract",
        [],
        address2
      );
      
      expect(result).toBeOk(Cl.bool(true));
    });

    it("guardian cannot unpause", () => {
      // Set guardian and pause
      simnet.callPublicFn(
        "trust-vault",
        "set-pause-guardian",
        [Cl.some(Cl.principal(address2))],
        deployer
      );
      simnet.callPublicFn("trust-vault", "pause-contract", [], address2);
      
      // Guardian tries to unpause
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "unpause-contract",
        [],
        address2
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });

    it("non-admin cannot set guardian", () => {
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "set-pause-guardian",
        [Cl.some(Cl.principal(address3))],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1000)); // ERR-NOT-AUTHORIZED
    });
  });

  describe("Pause Affects All Operations", () => {
    beforeEach(() => {
      // Register identities before pausing
      const hash1 = new Uint8Array(32).fill(10);
      const hash2 = new Uint8Array(32).fill(11);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash1), Cl.none()], address1);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash2), Cl.none()], address2);
      
      // Pause contract
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
    });

    it("blocks credential issuance when paused", () => {
      const claimHash = new Uint8Array(32).fill(20);
      const expiration = simnet.blockHeight + 100;
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "issue-credential",
        [
          Cl.principal(address2),
          Cl.buffer(claimHash),
          Cl.uint(expiration),
          Cl.stringUtf8("Test")
        ],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1012)); // ERR-CONTRACT-PAUSED
    });

    it("blocks credential revocation when paused", () => {
      // Unpause temporarily to issue credential
      simnet.callPublicFn("trust-vault", "unpause-contract", [], deployer);
      
      const claimHash = new Uint8Array(32).fill(21);
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
      
      // Pause again
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
      
      // Try to revoke
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "revoke-credential",
        [Cl.principal(address1), Cl.uint(0)],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1012)); // ERR-CONTRACT-PAUSED
    });

    it("blocks ZK proof submission when paused", () => {
      const proofHash = new Uint8Array(32).fill(30);
      const proofData = new Uint8Array(128).fill(99);
      
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "submit-proof",
        [Cl.buffer(proofHash), Cl.buffer(proofData)],
        address1
      );
      
      expect(result).toBeErr(Cl.uint(1012)); // ERR-CONTRACT-PAUSED
    });

    it("blocks recovery initiation when paused", () => {
      // Unpause to set recovery address
      simnet.callPublicFn("trust-vault", "unpause-contract", [], deployer);
      
      const hash3 = new Uint8Array(32).fill(12);
      simnet.callPublicFn("trust-vault", "register-identity", 
        [Cl.buffer(hash3), Cl.some(Cl.principal(address3))], address1);
      
      // Pause again
      simnet.callPublicFn("trust-vault", "pause-contract", [], deployer);
      
      // Try recovery
      const newHash = new Uint8Array(32).fill(13);
      const { result } = simnet.callPublicFn(
        "trust-vault",
        "initiate-recovery",
        [Cl.principal(address1), Cl.buffer(newHash)],
        address3
      );
      
      expect(result).toBeErr(Cl.uint(1012)); // ERR-CONTRACT-PAUSED
    });
  });
});
