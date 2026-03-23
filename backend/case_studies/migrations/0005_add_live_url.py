# Generated manually for CaseStudy.live_url

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("case_studies", "0004_add_case_study_images"),
    ]

    operations = [
        migrations.AddField(
            model_name="casestudy",
            name="live_url",
            field=models.CharField(
                blank=True,
                help_text="URL del sitio en vivo; vacío o # si no aplica.",
                max_length=500,
                verbose_name="Live site URL",
            ),
        ),
    ]
