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


import ssl
import socket
import os
import logging
import time

from PyQt4 import QtCore

from httprouter import HttpRouter

from socketserver import BaseServer, ThreadingMixIn
from http.server import BaseHTTPRequestHandler, HTTPServer



class CustomHandler(BaseHTTPRequestHandler, HttpRouter):
    """
    Stateless session handler to handle the HTTP request and process it.
    This class handles just the overrides to the base methods and the logic to invoke the methods within the HttpRouter
    class.
    DO not try change the structure as this is as per the documentation.
    """

    def do_POST(self):
        """
        Present pages / data and invoke URL level user authentication.
        """
        self.do_post_processor()

    def do_GET(self):
        """
        Present pages / data and invoke URL level user authentication.
        """
        self.do_post_processor()

    def do_OPTIONS(self):
        """
        Allow JSON OPTIONS requests
        """
        self.do_post_processor()

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    pass


class HttpThread(QtCore.QThread):
    """
    A special Qt thread class to allow the HTTP server to run at the same time as the UI.
    """
    def __init__(self, server):
        """
        Constructor for the thread class.

        :param server: The http server class.
        """
        super(HttpThread, self).__init__(None)
        self.http_server = server

    def run(self):
        """
        Run the thread.
        """
        self.http_server.start_server()

    def stop(self):
        self.http_server.stop = True


class SpaceServer():
    def __init__(self, parent):
        """
        Initialise the http server, and start the server of the correct type http / https
        """
        super(SpaceServer, self).__init__()
        self.parent = parent
        self.http_thread = HttpThread(self)
        self.http_thread.start()

    def start_server(self):
        """
        Start the correct server and save the handler
        """
        address = '0.0.0.0'
        self.address = address
        port = 9002
        self.port = port
        self.start_server_instance(address, port, ThreadingHTTPServer)
        if hasattr(self, 'httpd') and self.httpd:
            self.httpd.serve_forever()
        else:
            print('Failed to start server')

    def start_server_instance(self, address, port, server_class):
        """
        Start the server

        :param address: The server address
        :param port: The run port
        :param server_class: the class to start
        """
        loop = 1
        while loop < 4:
            try:
                print("%s:%s" % (address, port))
                self.httpd = server_class((address, port), CustomHandler)
                print("Server started for class %s %s %d" % (server_class, address, port))
                break
            except OSError:
                print("failed to start http server thread state %d %s" %
                          (loop, self.http_thread.isRunning()))
                loop += 1
                time.sleep(0.1)
            except:
                print('Failed to start server ')
                loop += 1
                time.sleep(0.1)

    def stop_server(self):
        """
        Stop the server
        """
        if self.http_thread.isRunning():
            self.http_thread.stop()
        self.httpd = None
        print('Stopped the server.')
