# Generated by Django 4.0.4 on 2024-07-13 14:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wander_wave', '0004_postphoto_photos'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='postphoto',
            name='photos',
        ),
        migrations.AddField(
            model_name='post',
            name='photos',
            field=models.ManyToManyField(blank=True, related_name='posts', to='wander_wave.postphoto'),
        ),
    ]
