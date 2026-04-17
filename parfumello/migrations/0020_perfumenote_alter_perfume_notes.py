import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('parfumello', '0019_order_orderitem'),
    ]

    operations = [
        # Step 1: Create the PerfumeNote through table
        migrations.CreateModel(
            name='PerfumeNote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tier', models.CharField(choices=[('top', 'Top'), ('middle', 'Middle'), ('base', 'Base')], default='top', max_length=10)),
                ('note', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='perfume_notes', to='parfumello.note')),
                ('perfume', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='perfume_notes', to='parfumello.perfume')),
            ],
            options={
                'unique_together': {('perfume', 'note')},
            },
        ),

        # Step 2: Copy existing M2M rows into the new through table (all default to 'top')
        migrations.RunSQL(
            sql="""
                INSERT INTO parfumello_perfumenote (perfume_id, note_id, tier)
                SELECT perfume_id, note_id, 'top'
                FROM parfumello_perfume_notes;
            """,
            reverse_sql="""
                INSERT INTO parfumello_perfume_notes (perfume_id, note_id)
                SELECT perfume_id, note_id
                FROM parfumello_perfumenote;
            """,
        ),

        # Step 3: Remove the old auto-created M2M table
        migrations.RunSQL(
            sql="DROP TABLE parfumello_perfume_notes;",
            reverse_sql="""
                CREATE TABLE parfumello_perfume_notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    perfume_id INTEGER NOT NULL REFERENCES parfumello_perfume(id),
                    note_id INTEGER NOT NULL REFERENCES parfumello_note(id),
                    UNIQUE (perfume_id, note_id)
                );
            """,
        ),

        # Step 4: Update Django's state only (DB is already correct after steps 1-3)
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AlterField(
                    model_name='perfume',
                    name='notes',
                    field=models.ManyToManyField(related_name='perfumes', through='parfumello.PerfumeNote', to='parfumello.note'),
                ),
            ],
            database_operations=[],
        ),
    ]
