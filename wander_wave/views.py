from datetime import datetime

from django.shortcuts import render
from rest_framework import viewsets

from wander_wave.models import (
    Post,
    Location,
    Like,
    Comment,
    Subscription,
    Hashtag
)

from wander_wave.serializers import (
    PostSerializer,
    PostDetailSerializer,
    PostListSerializer,
    LocationSerializer,
    LocationListSerializer,
    LocationDetailSerializer
)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    
    def get_queryset(self):
        city = self.request.query_params.get("city", None)
        country = self.request.query_params.get("country", None)
        
        queryset = self.queryset
        
        if city:
            queryset = self.queryset.filter(city__icontains=city)
        
        if country:
            queryset = self.queryset.filter(country__icontains=country)
        
        return queryset.distinct()
    
    def get_serializer_class(self):
        if self.action == "list":
            return LocationListSerializer
        
        if self.action == "retrieve":
            return LocationDetailSerializer
        
        return LocationSerializer
        

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_queryset(self):
        location = self.request.query_params.get("location", None)
        username = self.request.query_params.get("user__username", None)
        created_at = self.request.query_params.get("created_at", None)

        queryset = self.queryset

        if location:
            queryset = self.queryset.filter(location=location)

        if username:
            queryset = self.queryset.filter(username=username)

        if created_at:
            date_c = datetime.strptime(created_at, "%Y-%m-%d").date()
            queryset = queryset.filter(date_posted__date=date_c)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer

        if self.action == "retrieve":
            return PostDetailSerializer

        return PostSerializer
