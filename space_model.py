import subprocess, json

class SpaceModel(object):

    __instance__ = None

    def __new__(cls):
        """
        Re-implement the __new__ method to make sure we create a true singleton.
        """
        if not cls.__instance__:
            cls.__instance__ = object.__new__(cls)
        return cls.__instance__

    @classmethod
    def create(cls):
        model = cls()
        return model

    def setController(self, window):
        self.controller = window

    def pollDisplay(self):
        return self.controller.pollDisplay()

    def pollTerminal(self):
        return self.controller.pollTerminal()

    def login(self, uid):
        return self.controller.login(uid)

    def vote(self, gungees):
        return self.controller.vote(gungees)

    def vote_config(self, count, mode):
        return self.controller.vote_config(count, mode)

    def play_sound(self, id, vis):
        return self.controller.play_sound(id, vis)

    def reveal_result(self, place):
        return self.controller.reveal_result(place)

    def mainscreen(self, mode):
        return self.controller.mainscreen(mode)

    def set_destination(self, destination):
        return self.controller.set_destination(destination)

    def termmode(self, mode):
        return self.controller.termmode(mode)

    def logout(self):
        return self.controller.logout()

    def soundboard(self):
        return self.controller.soundboard()

    def register(self, uid, name, privilege):
        return self.controller.register(uid, name, privilege)