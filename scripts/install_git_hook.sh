#!/bin/bash
#
# Install Git Pre-Commit Hook for Automatic Validation
#
# This script installs a git hook that automatically validates
# question files before allowing commits.
#
# Usage: bash install_git_hook.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Installing Git Pre-Commit Hook for Automatic Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find git root directory
GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$GIT_ROOT" ]; then
    echo "❌ Error: Not in a git repository!"
    echo "   This script must be run from a git repository."
    echo "   Run: git init"
    exit 1
fi

HOOK_DIR="$GIT_ROOT/.git/hooks"
HOOK_FILE="$HOOK_DIR/pre-commit"

# Create hooks directory if it doesn't exist
mkdir -p "$HOOK_DIR"

# Create the pre-commit hook
cat > "$HOOK_FILE" << 'EOF'
#!/bin/bash
#
# Pre-commit hook: Validate questions before commit
#

echo ""
echo "🔍 Running automatic validation on changed question files..."
echo ""

QUESTIONS_DIR="src/data/questions"
VALIDATION_SCRIPTS="scripts"

# Check if questions directory exists
if [ ! -d "$QUESTIONS_DIR" ]; then
    exit 0  # Not in aigneous_millionwhys project, skip validation
fi

# Get list of changed JSON files in questions directory
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "^$QUESTIONS_DIR/.*\.json$")

if [ -z "$CHANGED_FILES" ]; then
    echo "✓ No question files changed, skipping validation"
    exit 0
fi

echo "Changed question files:"
echo "$CHANGED_FILES" | sed 's/^/  - /'
echo ""

# Run validation on each changed file
VALIDATION_FAILED=0

for file in $CHANGED_FILES; do
    # Extract just the filename
    filename=$(basename "$file")

    echo "Validating: $filename"

    # Run auto_validate.py from scripts directory
    if python3 "$VALIDATION_SCRIPTS/auto_validate.py" "$QUESTIONS_DIR/$filename" > /dev/null 2>&1; then
        echo "  ✅ PASSED"
    else
        echo "  ❌ FAILED - Critical issues found!"
        VALIDATION_FAILED=1

        # Show detailed errors
        echo ""
        echo "  Running detailed validation:"
        python3 "$VALIDATION_SCRIPTS/auto_validate.py" "$QUESTIONS_DIR/$filename"
    fi
done

echo ""

if [ $VALIDATION_FAILED -eq 1 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ COMMIT BLOCKED: Validation failed!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please fix the issues above before committing."
    echo ""
    echo "To bypass this check (not recommended):"
    echo "  git commit --no-verify"
    echo ""
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All validations passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 0
EOF

# Make the hook executable
chmod +x "$HOOK_FILE"

echo ""
echo "✅ Git pre-commit hook installed successfully!"
echo ""
echo "📋 What this means:"
echo "   • Every time you commit, changed .json files will be validated"
echo "   • Commits will be BLOCKED if critical issues are found"
echo "   • You'll be prompted to fix issues before committing"
echo ""
echo "🧪 Test the hook:"
echo "   1. Make a change to a question file"
echo "   2. Try to commit: git add . && git commit -m 'test'"
echo "   3. The hook will run validation automatically"
echo ""
echo "🔓 To bypass (emergency only):"
echo "   git commit --no-verify"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
