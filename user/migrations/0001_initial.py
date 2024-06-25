# Generated by Django 4.0.4 on 2024-06-25 12:52

import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.manager
import django.utils.timezone
import user.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('avatar', models.ImageField(blank=True, null=True, upload_to=user.models.avatar_path, verbose_name='avatar')),
                ('username', models.CharField(max_length=50, unique=True, verbose_name='username')),
                ('status', models.CharField(choices=[('Road Tripper', 'Road Tripper'), ('Cruiser', 'Cruiser'), ('Backpacker', 'Backpacker'), ('Flyer', 'Flyer'), ('Cyclist', 'Cyclist'), ('Hiker', 'Hiker'), ('Railway Explorer', 'Rail Exp'), ('Sailor', 'Sailor'), ('Recreational Vehicle Traveler', 'Rver'), ('Nomad', 'Nomad')], max_length=50, verbose_name='status')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email address')),
                ('first_name', models.CharField(max_length=100, verbose_name='first name')),
                ('last_name', models.CharField(max_length=100, verbose_name='last name')),
                ('about_me', models.TextField(blank=True, null=True, verbose_name='about me')),
                ('password', models.CharField(max_length=255, verbose_name='password')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('object', django.db.models.manager.Manager()),
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
