from setuptools import setup, find_packages
import os
import sys

print "Sys.prefix:" + sys.prefix

setup(
    name="iopy",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    author="Adam Saxen",
    author_email="adam@asaxen.com",
    description="This package is used for python scripts in nabton solution",
    license="MIT",
    keywords="",
    url="http://ioant.com",   # project home page, if any
    install_requires=[
        "nose>=1.3.7",
        "MySQL-python >= 1.2.5"
    ],

)
