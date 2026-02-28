(function() {
    Window_TitleCommand.prototype.makeCommandList = function() {
        this.addCommand(TextManager.newGame,            'newGame');
        this.addCommand(TextManager.continue_,          'continue', this.isContinueEnabled());
        this.addCommand(TextManager.options,            'options');
        this.addCommand("Tutorial Tips",                'tips');
        this.addCommand("Screenshots",                  'screenshots');
        this.addCommand("Roadmap",                      'roadmap');
        this.addCommand(Yanfly.Param.CreditsCmdName,    'credits');
        this.addCommand(TextManager.exitGame,           'exitGame');
    };

    var Scene_Title_prototype_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        Scene_Title_prototype_createCommandWindow.call(this);
        this._commandWindow.setHandler('roadmap', this.commandRoadmap.bind(this));
    };

    Scene_Title.prototype.commandRoadmap = function() {
        var url = 'https://docs.google.com/document/d/10OXdyxFGIBdUedy7iqpJsw-q__cW-2UoPpm7ceGzhqc/preview?usp=sharing';
        if (typeof require !== 'undefined') {
            require('nw.gui').Shell.openExternal(url);
        } else {
            window.open(url, '_blank');
        }
        this._commandWindow.activate();
    };
})();