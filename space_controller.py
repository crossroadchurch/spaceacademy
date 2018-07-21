# -*- coding: utf-8 -*-
# vim: autoindent shiftwidth=4 expandtab textwidth=120 tabstop=4 softtabstop=4

import sys, json, os, math, sqlite3, datetime
from PyQt4 import QtGui, QtCore
from PyQt4.QtCore import Qt
from ui_space_controller import Ui_MainWindow
from httpserver import SpaceServer
from space_model import SpaceModel

class SpaceController(QtGui.QMainWindow, Ui_MainWindow):

    def __init__(self):
        QtGui.QMainWindow.__init__(self)
        Ui_MainWindow.__init__(self)
        self.setupUi(self)
        # Start server for display
        self.update_id = 0
        self.current_user = 0
        self.HELPER = 1
        self.CHILD = 2
        self.TERM_BEEPS = 0
        self.TERM_ADMIN = 1
        self.TERM_SOUND = 2
        self.TERM_PREVOTE = 3
        self.TERM_VOTE = 4
        self.TERM_SCREEN = 5
        self.MAIN_WARP = 0
        self.MAIN_ORBIT = 1
        self.MAIN_COMMS = 2
        self.MAIN_JARVIS = 3
        self.current_priv = 0
        self.current_name = ""
        self.max_votes = 0
        self.vote_mode = 0
        self.mainscreen_mode = 0
        self.sound_id = -1
        self.sound_actor = -1
        self.terminal_mode = 0
        self.millionaire_server = SpaceServer(self)
        SpaceModel.create()
        SpaceModel().setController(self)

        db, cursor = self.db_connect()
        cursor.execute('''
            SELECT g.GungeeId, g.GungeeName, g.GungeeURL
            FROM Gungee AS g
        ''')
        self.gungee_data = list(cursor.fetchall())
        print(self.gungee_data)
        db.close()
        return


    def db_connect(self):
        db = sqlite3.connect('space.db')
        cursor = db.cursor()
        return db, cursor


    def pollDisplay(self):
        return {
            "mode": self.mainscreen_mode,
            "sound_id": self.sound_id,
            "actor": self.sound_actor
        }

    def pollTerminal(self):
        return {
            "mode": self.terminal_mode,
            "gungees": self.gungee_data,
            "max_votes": self.max_votes
        }


    def login(self, uid):
        # This is called each time a card is scanned
        # The scanner prevents multiple scans of the same card
        db, cursor = self.db_connect()
        cursor.execute('''
            SELECT u.UserId, u.Name, u.Privilege
            FROM User AS u
            WHERE u.UID = {ui}
        '''.format(ui = uid))
        result = cursor.fetchone()
        db.close()
        if result == None:
            self.current_user = 0
            self.current_name = ""
            self.current_priv = 0
            self.terminal_mode = self.TERM_BEEPS
        else:
            self.current_user = result[0]
            self.current_name = result[1]
            self.current_priv = result[2]
            print("User " + self.current_name + " logged in")
            if self.current_priv == self.CHILD:
                if self.terminal_mode == self.TERM_PREVOTE:
                    self.terminal_mode = self.TERM_VOTE
            elif self.current_priv == self.HELPER:
                self.terminal_mode = self.TERM_ADMIN
            else:
                self.terminal_mode = self.TERM_BEEPS
        return True
    
    def logout(self):
        self.current_user = 0
        self.current_priv = 0
        self.current_name = ""
        self.terminal_mode = self.TERM_BEEPS
        return True

    def vote_config(self, count, mode):
        self.max_votes = int(count)
        self.vote_mode = int(mode)
        if self.vote_mode == 1:
            self.terminal_mode = self.TERM_PREVOTE
        return True

    def vote(self, gungees):
        gungee_list = gungees.split('-')
        if self.vote_mode == 1:
            if self.current_priv == self.CHILD:
                db, cursor = self.db_connect()
                for i in range(self.max_votes):
                    if i < len(gungee_list):
                        cursor.execute('''
                            INSERT INTO Vote(GungeeId, UserId, VoteTime)
                            VALUES({gi}, {ui}, \"{vt}\")
                        '''.format(gi = int(gungee_list[i]), ui = self.current_user, 
                                vt = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
                        db.commit()
                db.close()
                print("Vote cast")
                self.terminal_mode = self.TERM_PREVOTE
            else:
                print("Only children can vote!")
        else:
            print("It's not time to vote!")
        return True

    def register(self, uid, name, privilege):
        # Check if uid exists in User table, if not add to database.  If so, update name and privilege
        db, cursor = self.db_connect()
        cursor.execute('''
            SELECT u.UserId
            FROM User AS u
            WHERE u.UID = {ui}
        '''.format(ui = uid))
        result = cursor.fetchone()
        if result == None:
            # Add to database
            cursor.execute('''
                INSERT INTO User(UID, Name, Privilege)
                VALUES({ui}, \"{nm}\", {pv})
            '''.format(ui = uid, nm = name, pv = privilege))
            db.commit()
            db.close()
            print("User " + name + " (" + str(uid) + ") registered")
        else:
            # Update database
            cursor.execute('''
                UPDATE User
                SET Name = \"{nm}\", Privilege = {pv}
                WHERE User.UserId = {id}
            '''.format(nm = name, pv = privilege, id = result[0]))
            db.commit()
            db.close()
            print("User " + name + " (" + str(uid) + ") updated")
        return True

    def mainscreen(self, mode):
        if self.mainscreen_mode != int(mode):
            self.mainscreen_mode = int(mode)
        return True

    def termmode(self, mode):
        if self.terminal_mode != int(mode):
            self.terminal_mode = int(mode)
        return True

    def soundboard(self):
        print("Soundboard mode")
        self.terminal_mode = self.TERM_SOUND
        return True

    def play_sound(self, id, vis):
        self.mainscreen_mode = self.MAIN_JARVIS
        self.sound_id = id
        self.sound_actor = vis
        return True



if __name__ == "__main__":
    app = QtGui.QApplication(sys.argv)
    window = SpaceController()
    window.show()
    sys.exit(app.exec_())