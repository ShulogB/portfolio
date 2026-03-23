# Generated manually: scale_constraints, rejected_approaches, what_would_break, deep_dive, adrs, diagram_type, ascii_diagram

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("case_studies", "0006_add_tech_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="casestudy",
            name="scale_constraints",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='{"requestVolume":"","concurrency":"","externalDependencies":"","failureModes":"","dataConsistency":""}',
                verbose_name="Scale constraints (EN)",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="scale_constraints_es",
            field=models.JSONField(blank=True, default=dict, verbose_name="Scale constraints (ES)"),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="rejected_approaches",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='[{"approach":"","reason":""}]',
                verbose_name="Rejected approaches (EN)",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="rejected_approaches_es",
            field=models.JSONField(blank=True, default=list, verbose_name="Rejected approaches (ES)"),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="what_would_break",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='["string", ...]',
                verbose_name="What would break (EN)",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="what_would_break_es",
            field=models.JSONField(blank=True, default=list, verbose_name="What would break (ES)"),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="deep_dive",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='[{"title":"","paragraphs":["",...]}]',
                verbose_name="Deep dive (EN)",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="deep_dive_es",
            field=models.JSONField(blank=True, default=list, verbose_name="Deep dive (ES)"),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="adrs",
            field=models.JSONField(
                blank=True,
                default=list,
                help_text='[{"title":"","href":""}]',
                verbose_name="ADRs",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="diagram_type",
            field=models.CharField(
                blank=True,
                help_text='"payments" or "identity" for architecture diagram',
                max_length=32,
                verbose_name="Diagram type",
            ),
        ),
        migrations.AddField(
            model_name="casestudy",
            name="ascii_diagram",
            field=models.TextField(blank=True, verbose_name="ASCII diagram"),
        ),
    ]
