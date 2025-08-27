"""
Common styling and themes for Magnetiq v2 diagrams
"""

# Magnetiq v2 color scheme
MAGNETIQ_COLORS = {
    "primary": "#2563eb",      # Blue
    "secondary": "#7c3aed",    # Purple  
    "accent": "#059669",       # Green
    "neutral": "#6b7280",      # Gray
    "warning": "#d97706",      # Orange
    "error": "#dc2626",        # Red
    "info": "#0891b2",         # Cyan
}

def apply_magnetiq_theme(diagram_config):
    """Apply consistent Magnetiq v2 styling to diagrams"""
    return {
        **diagram_config,
        "graph_attr": {
            "fontname": "Arial",
            "fontsize": "12",
            "bgcolor": "white",
            "pad": "0.5",
            "ranksep": "1.0",
            "nodesep": "0.5"
        },
        "node_attr": {
            "fontname": "Arial",
            "fontsize": "10",
            "style": "rounded,filled",
            "fillcolor": MAGNETIQ_COLORS["primary"],
            "fontcolor": "white",
            "margin": "0.2"
        },
        "edge_attr": {
            "fontname": "Arial",
            "fontsize": "9",
            "color": MAGNETIQ_COLORS["neutral"]
        }
    }

def get_cluster_style(cluster_type="default"):
    """Get styling for different cluster types"""
    styles = {
        "default": {
            "bgcolor": "#f3f4f6",
            "style": "rounded",
            "margin": "10"
        },
        "layer": {
            "bgcolor": "#eff6ff",
            "style": "rounded,dashed",
            "margin": "15"
        },
        "component": {
            "bgcolor": "#f0fdf4",
            "style": "rounded",
            "margin": "10"
        },
        "database": {
            "bgcolor": "#fef3c7",
            "style": "rounded",
            "margin": "10"
        }
    }
    return styles.get(cluster_type, styles["default"])