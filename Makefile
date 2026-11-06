
help:
	@echo "Available targets:"
	@echo "  help - Show this help"
	@echo "  check-orphan-burgees - Check for orphaned burgee images"
	@echo "  check-missing-burgees - Check for missing burgee images"
	@echo "  check-duplicates - Check for burgee images used by more than one club"
	@echo "  all - Run all checks"
	@echo "  serve - Serve the web pages at http://localhost:8000/web/"

all: check-orphan-burgees check-missing-burgees check-duplicates

check-orphan-burgees:
	@echo "Checking for orphaned burgee images..."
	@python3 scripts/check_orphan_burgees.py

check-missing-burgees:
	@echo "Checking for missing burgee images..."
	@python3 scripts/check_missing_burgees.py

check-duplicates:
	@echo "Checking for duplicate burgee references..."
	@python3 scripts/check_duplicate_burgees.py

serve:
	@echo "Open http://localhost:8000/web/"
	@python3 -m http.server 8000
