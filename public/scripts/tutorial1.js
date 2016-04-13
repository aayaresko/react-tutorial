/**
 * Created by aayaresko on 11.04.16.
 */
/*
var data = [
    {id:1, author:"Pete Hunt", text:"This is one comment"},
    {id:2, author:"Jordan Walke", text:"This is *another* comment"}
];
*/
var Comment = React.createClass({
    rawMarkup: function () {
        if (this.props.children) {
            var rawMarkup = marked(this.props.children.toString(), {sanitize:true});
            return {__html: rawMarkup};
        }
    },
    render: function () {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()} />
            </div>
        );
    }
});
var CommentBox = React.createClass({
    loadCommentsFromServer: function () {
        jQuery.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function ( data ) {
                this.setState({data:data});
            }.bind(this),
            error: function ( xhr, status, err ) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function ( comment ) {
        var comments = this.state.data;
        comment.id = Date.now()
        var newComments = comments.concat([comment]);
        this.setState({data:newComments});
        jQuery.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function ( data ) {
                this.setState({data:data});
            }.bind(this),
            error: function ( xhr, status, err ) {
                this.setState({data:comments});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    getInitialState: function () {
        return {data:[]};
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
            </div>
        );
    }
});
var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function ( comment ) {
            return (
                <Comment author={comment.author} key={comment.id}>
                    {comment.text}
                </Comment>
            )
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        )
    }
});
var CommentForm = React.createClass({
    getInitialState: function () {
        return {author:'', text:''};
    },
    handleAuthorChange: function ( event ) {
        this.setState({author:event.target.value});
    },
    handleTextChange: function ( event ) {
        this.setState({text:event.target.value});
    },
    handleSubmit: function ( event ) {
        event.preventDefault();
        var author = this.state.author.trim(),
            text = this.state.text.trim();
        if (!text || !author) {
            return;
        }
        this.props.onCommentSubmit({author:author, text:text});
        this.setState({author:'', text:''});
    },
    render: function () {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.author}
                    onChange={this.handleAuthorChange}
                />
                <input
                    type="text"
                    placeholder="Say something..."
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type="submit" value="Post" />
            </form>
        );
    }
});
ReactDOM.render(
    <CommentBox url='/api/comments' pollInterval={2000} />,
    document.getElementById('content')
);