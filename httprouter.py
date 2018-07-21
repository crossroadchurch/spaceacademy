# -*- coding: utf-8 -*-
# vim: autoindent shiftwidth=4 expandtab textwidth=120 tabstop=4 softtabstop=4

###############################################################################
# Copyright (c) 2017 Graham Knight                                            #
# HTTP Router and Server derived from code in OpenLP                          #
# --------------------------------------------------------------------------- #
# This program is free software; you can redistribute it and/or modify it     #
# under the terms of the GNU General Public License as published by the Free  #
# Software Foundation; version 2 of the License.                              #
#                                                                             #
# This program is distributed in the hope that it will be useful, but WITHOUT #
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or       #
# FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for    #
# more details.                                                               #
#                                                                             #
# You should have received a copy of the GNU General Public License along     #
# with this program; if not, write to the Free Software Foundation, Inc., 59  #
# Temple Place, Suite 330, Boston, MA 02111-1307 USA                          #
###############################################################################

"""

*Routes:*

``/``
    Go to the web interface.

``/files/{filename}``
    Serve a static file.

"""
import base64
import json
import logging
import os
import re
import urllib.request
import urllib.error
from urllib.parse import urlparse, parse_qs
from space_model import SpaceModel
from PyQt4 import QtCore

FILE_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
}


class HttpRouter():
    """
    This code is called by the HttpServer upon a request and it processes it based on the routing table.
    This code is stateless and is created on each request.
    Some variables may look incorrect but this extends BaseHTTPRequestHandler.
    """
    def initialise(self):
        """
        Initialise the router stack and any other variables.
        """
        self.routes = [
            ('^/$', {'function': self.serve_file, 'secure': False}),
            (r'^/files/(.*)$', {'function': self.serve_file, 'secure': False}),
            ('^/(terminal)$', {'function': self.serve_file, 'secure': False}),
            (r'^/pollDisplay$', {'function': self.pollDisplay, 'secure': False}),
            (r'^/pollTerminal$', {'function': self.pollTerminal, 'secure': False}),
            (r'^/login/(.*)$', {'function': self.login, 'secure': False}),
            (r'^/logout/(.*)$', {'function': self.logout, 'secure': False}),
            (r'^/soundboard/(.*)$', {'function': self.soundboard, 'secure': False}),
            (r'^/vote/(.*)$', {'function': self.vote, 'secure': False}),
            (r'^/vote_config/(.*)/(.*)$', {'function': self.vote_config, 'secure': False}),
            (r'^/play_sound/(.*)/(.*)$', {'function': self.play_sound, 'secure': False}),
            (r'^/mainscreen/(.*)$', {'function': self.mainscreen, 'secure': False}),
            (r'^/termmode/(.*)$', {'function': self.termmode, 'secure': False}),
            (r'^/register/(.*)/(.*)/(.*)$', {'function': self.register, 'secure': False})
        ]
        self.html_dir = os.path.join('', 'html')
        
    def do_post_processor(self):
        """
        Handle the POST amd GET requests placed on the server.
        """
        if self.path == '/favicon.ico':
            return
        if not hasattr(self, 'auth'):
            self.initialise()
        function, args = self.process_http_request(self.path)
        if not function:
            self.do_http_error()
            return
        self.call_function(function, *args)

    def call_function(self, function, *args):
        """
        Invoke the route function passing the relevant values

        :param function: The function to be called.
        :param args: Any passed data.
        """
        response = function['function'](*args)
        if response:
            self.wfile.write(response)
            return

    def process_http_request(self, url_path, *args):
        """
        Common function to process HTTP requests

        :param url_path: The requested URL.
        :param args: Any passed data.
        """
        self.request_data = None
        url_path_split = urlparse(url_path)
        url_query = parse_qs(url_path_split.query)
        if 'data' in url_query.keys():
            self.request_data = url_query['data'][0]
        for route, func in self.routes:
            match = re.match(route, url_path_split.path)
            if match:
                #print('Route "%s" matched "%s"', route, url_path)
                args = []
                for param in match.groups():
                    args.append(param)
                return func, args
        return None, None

    def set_cache_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")

    def do_http_success(self):
        """
        Create a success http header.
        """
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.set_cache_headers()
        self.end_headers()

    def do_json_header(self):
        """
        Create a header for JSON messages
        """
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Headers', 'Content-type')
        self.send_header('Access-Control-Allow-Origin', '*')

        self.set_cache_headers()
        self.end_headers()

    def do_http_error(self):
        """
        Create a error http header.
        """
        self.send_response(404)
        self.send_header('Content-type', 'text/html')
        self.set_cache_headers()
        self.end_headers()

    def do_not_found(self):
        """
        Create a not found http header.
        """
        self.send_response(404)
        self.send_header('Content-type', 'text/html')
        self.set_cache_headers()
        self.end_headers()
        self.wfile.write(bytes('<html><body>Sorry, an error occurred </body></html>', 'UTF-8'))


    def serve_file(self, file_name=None):
        """
        Send a file to the socket. For now, just a subset of file types and must be top level inside the html folder.
        If subfolders requested return 404, easier for security for the present.
        """
        #print('serve file request %s' % file_name)
        if not file_name:
            file_name = 'index.html'
        elif file_name == 'terminal':
            file_name = 'terminal.html'
        path = os.path.normpath(os.path.join(self.html_dir, file_name))
        if not path.startswith(self.html_dir):
            return self.do_not_found()
        content = None
        ext, content_type = self.get_content_type(path)
        file_handle = None
        try:
            file_handle = open(path, 'rb')
            #print('Opened %s' % path)
            content = file_handle.read()
        except IOError:
            #print('Failed to open %s' % path)
            return self.do_not_found()
        finally:
            if file_handle:
                file_handle.close()
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.end_headers()
        return content

    def get_content_type(self, file_name):
        """
        Examines the extension of the file and determines what the content_type should be, defaults to text/plain
        Returns the extension and the content_type
        """
        ext = os.path.splitext(file_name)[1]
        content_type = FILE_TYPES.get(ext, 'text/plain')
        return ext, content_type

    def pollDisplay(self):
        display_data = SpaceModel().pollDisplay()
        self.do_json_header()
        return json.dumps(display_data).encode()

    def pollTerminal(self):
        display_data = SpaceModel().pollTerminal()
        self.do_json_header()
        return json.dumps(display_data).encode()

    def login(self, uid):
        success = SpaceModel().login(uid)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def vote(self, gungees):
        success = SpaceModel().vote(gungees)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def vote_config(self, count, mode):
        success = SpaceModel().vote_config(count, mode)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def play_sound(self, id, vis):
        success = SpaceModel().play_sound(id, vis)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def mainscreen(self, mode):
        success = SpaceModel().mainscreen(mode)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def termmode(self, mode):
        success = SpaceModel().termmode(mode)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def logout(self, args):
        success = SpaceModel().logout()
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def soundboard(self, args):
        success = SpaceModel().soundboard()
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()

    def register(self, uid, name, privilege):
        success = SpaceModel().register(uid, name, privilege)
        self.do_json_header()
        return json.dumps({'results': {'success': success}}).encode()
