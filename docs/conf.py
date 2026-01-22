import os
import sys
from datetime import date

# Paths -----------------------------------------------------------------------
PROJECT_ROOT = os.path.abspath("..")
BACKEND_APP = os.path.join(PROJECT_ROOT, "backend", "app")
sys.path.insert(0, PROJECT_ROOT)
sys.path.insert(0, BACKEND_APP)

# Project information ---------------------------------------------------------
project = "Sam Kitchen PA"
author = "Evie Barker & Dom Longhorn"
copyright = f"{date.today().year}, {author}"

# General configuration -------------------------------------------------------
extensions = [
    "myst_parser",
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx.ext.autosectionlabel",
    "autoapi.extension",
]

templates_path = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

myst_enable_extensions = ["colon_fence", "deflist"]

# HTML output -----------------------------------------------------------------
html_theme = "sphinx_rtd_theme"
html_static_path = ["_static"]

# AutoAPI (code reference) ----------------------------------------------------
autoapi_type = "python"
autoapi_dirs = [BACKEND_APP]
autoapi_root = "reference"
autoapi_add_toctree_entry = True
autoapi_python_class_content = "both"

# Autodoc defaults ------------------------------------------------------------
autodoc_typehints = "description"
autodoc_member_order = "bysource"
