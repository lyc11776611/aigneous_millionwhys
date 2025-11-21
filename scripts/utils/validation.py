#!/usr/bin/env python3
"""
Validation Integration - Runs all validation layers

Integrates the 2-layer validation system:
1. Format validation (auto_validate.py)
2. Fact checking (validate_facts.py)

Note: AI fact-checking (Layer 3) was removed. Fact-checking is now done
interactively by Claude Code in conversation before running scripts.
"""

import subprocess
import sys
from pathlib import Path
from typing import Tuple, Optional


class ValidationRunner:
    """Runs all validation layers and reports results"""

    def __init__(self, scripts_dir: Optional[Path] = None):
        """
        Initialize validation runner

        Args:
            scripts_dir: Path to scripts directory. If None, uses default.
        """
        if scripts_dir is None:
            self.scripts_dir = Path(__file__).parent.parent
        else:
            self.scripts_dir = Path(scripts_dir)

    def run_all_validations(self, verbose: bool = True) -> Tuple[bool, dict]:
        """
        Run all validation layers

        Args:
            verbose: Print detailed output

        Returns:
            Tuple of (all_passed, results_dict)
        """
        results = {
            'format_validation': None,
            'fact_checking': None,
            'all_passed': False
        }

        if verbose:
            print("🔍 Running 2-Layer Validation Pipeline...")
            print("=" * 60)

        # Layer 1: Format Validation
        if verbose:
            print("\n📋 Layer 1: Format Validation (auto_validate.py)")
        format_passed, format_output = self._run_format_validation(verbose)
        results['format_validation'] = {
            'passed': format_passed,
            'output': format_output
        }

        if not format_passed:
            if verbose:
                print("❌ Format validation failed. Fix errors before continuing.")
            return False, results

        # Layer 2: Fact Checking (rule-based)
        if verbose:
            print("\n🔬 Layer 2: Fact Checking (validate_facts.py)")
        fact_passed, fact_output = self._run_fact_checking(verbose)
        results['fact_checking'] = {
            'passed': fact_passed,
            'output': fact_output
        }

        # Overall result
        all_passed = format_passed and fact_passed
        results['all_passed'] = all_passed

        if verbose:
            print("\n" + "=" * 60)
            if all_passed:
                print("✅ All validations passed!")
            else:
                print("❌ Some validations failed. Please review above.")

        return all_passed, results

    def run_format_validation(self, verbose: bool = False) -> bool:
        """Run only format validation"""
        passed, _ = self._run_format_validation(verbose)
        return passed

    def run_fact_checking(self, verbose: bool = False) -> bool:
        """Run only fact checking"""
        passed, _ = self._run_fact_checking(verbose)
        return passed

    def _run_format_validation(self, verbose: bool) -> Tuple[bool, str]:
        """Run auto_validate.py"""
        script = self.scripts_dir / 'auto_validate.py'

        if not script.exists():
            return False, f"Script not found: {script}"

        try:
            result = subprocess.run(
                [sys.executable, str(script), '--all'],
                capture_output=True,
                text=True,
                timeout=60
            )

            if verbose:
                print(result.stdout)
                if result.stderr:
                    print(result.stderr, file=sys.stderr)

            return result.returncode == 0, result.stdout

        except subprocess.TimeoutExpired:
            return False, "Validation timed out"
        except Exception as e:
            return False, f"Error running validation: {e}"

    def _run_fact_checking(self, verbose: bool) -> Tuple[bool, str]:
        """Run validate_facts.py (rule-based fact checking)"""
        script = self.scripts_dir / 'validate_facts.py'

        if not script.exists():
            return False, f"Script not found: {script}"

        try:
            args = [sys.executable, str(script)]
            if verbose:
                args.append('--verbose')

            result = subprocess.run(
                args,
                capture_output=True,
                text=True,
                timeout=120
            )

            if verbose:
                print(result.stdout)
                if result.stderr:
                    print(result.stderr, file=sys.stderr)

            # Check if validation passed (look for 0 critical issues)
            passed = result.returncode == 0 and "Critical Issues: 0" in result.stdout

            return passed, result.stdout

        except subprocess.TimeoutExpired:
            return False, "Fact checking timed out"
        except Exception as e:
            return False, f"Error running fact checking: {e}"


# CLI for testing
if __name__ == '__main__':
    runner = ValidationRunner()
    passed, results = runner.run_all_validations(verbose=True)

    sys.exit(0 if passed else 1)
