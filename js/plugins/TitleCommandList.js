Window_TitleCommand.prototype.makeCommandList = function() {
    this.addCommand(TextManager.newGame,            'newGame');
    this.addCommand(TextManager.continue_,          'continue', this.isContinueEnabled());
    this.addCommand(TextManager.options,            'options');
    this.addCommand("Tutorial Tips",                'tips');
    this.addCommand("Screenshots",                  'screenshots');
    this.addCommand("Leaderboard",                  'leaderboard', !$gameTemp.isDemo());
    this.addCommand(Yanfly.Param.CreditsCmdName,    'credits');
    this.addCommand(TextManager.exitGame,           'exitGame');
};