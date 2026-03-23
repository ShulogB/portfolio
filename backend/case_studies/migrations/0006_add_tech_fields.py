# Generated manually for CaseStudy.tech, CaseStudy.tech_es

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("case_studies", "0005_add_live_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="casestudy",
            name="tech",
            field=models.CharField(
                blank=True,
                help_text="Tags under title, e.g. Payments • Webhooks • Concurrency",
                max_length=500,
                verbose_name="Tech (EN)",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="tech_es",
            field=models.CharField(blank=True, max_length=500, verbose_name="Tech (ES)"),
        ),
    ]
