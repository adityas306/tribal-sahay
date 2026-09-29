SCHEMES = [

    {
        "id": "pre-matric",
        "name": "Pre-Matric Scholarship",
        "level": "School",
        "summary": "Support for eligible ST students at the pre-matric level.",
        "criteria": {
            "max_income": 250000,
            "education": ["School"]
        }
    },

    {
        "id": "post-matric",
        "name": "Post-Matric Scholarship",
        "level": "Higher Education",
        "summary": "Financial support for eligible ST students pursuing post-matric studies.",
        "criteria": {
            "max_income": 300000,
            "education": ["College", "University"]
        }
    },

    {
        "id": "top-class",
        "name": "Top Class Scholarship",
        "level": "Higher Education",
        "summary": "Support for eligible ST students in notified higher education institutions/courses.",
        "criteria": {
            "max_income": 600000,
            "education": ["College", "University"]
        }
    },

    {
        "id": "nfst",
        "name": "National Fellowship for ST Students (NFST)",
        "level": "Research",
        "summary": "Fellowship support for eligible ST research scholars subject to scheme conditions.",
        "criteria": {
            "max_income": 800000,
            "education": ["University"]
        }
    },

    {
        "id": "nos",
        "name": "National Overseas Scholarship (NOS)",
        "level": "Overseas",
        "summary": "Support for eligible ST students pursuing higher studies abroad, subject to official criteria.",
        "criteria": {
            "max_income": 800000,
            "education": ["University"]
        }
    }
]


def check_eligibility(user):

    results = []

    for scheme in SCHEMES:

        criteria = scheme["criteria"]

        eligible = (
            user.category == "ST"
            and user.income <= criteria["max_income"]
            and user.education in criteria["education"]
        )

        if scheme["id"] == "nfst":
            eligible = eligible and user.net_jrf

        if scheme["id"] == "nos":
            eligible = (
                eligible
                and user.education == "University"
            )

        reason = (
            "Profile matches basic demo criteria"
            if eligible
            else
            "Some scheme conditions are not met in this demo eligibility engine"
        )

        results.append({
            **scheme,
            "eligible": eligible,
            "reason": reason
        })

    return results